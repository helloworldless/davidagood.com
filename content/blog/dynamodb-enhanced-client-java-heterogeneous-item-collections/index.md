---
title: "Working with Heterogeneous Item Collections in the DynamoDB Enhanced Client for Java" 
date: "2020-12-07T01:51:34.815Z"
description: "Working with heterogeneous item collections with the Java SDKs can be tricky. Here we see how to handle 
them with the AWS SDK v2 for Java's Enhanced Client."
---

Item collections are a core concept in DynamoDB, especially for "well-designed" applications using a single table 
design. However, this concept doesn't exactly have first class support in the SDKs. In this post, I demonstrate a 
strategy for querying heterogeneous item collections with the 
[AWS SDK v2 for Java's Enhanced Client](https://github.com/aws/aws-sdk-java-v2/tree/master/services-custom/dynamodb-enhanced).

_**Note:** An item collection refers to all the items with the same partition key._

Let's say we have an item collection formed of a customer and their orders:

PK | SK | Type | CustomerId | OrderId
---|----|------|------------|--------
CUSTOMER#123|#ORDER#2020-11-25|Order|123|2020-11-25
CUSTOMER#123|#ORDER#2020-12-01|Order|123|2020-12-01
CUSTOMER#123|#ORDER#2020-12-06|Order|123|2020-12-06
CUSTOMER#123|A|Customer|123|

## Observations

- The primary keys (partition key and sort key), use generic names, 'PK' and 'SK', as they may be overloaded with various 
  types of values as we will see below
- We use a composite partition key and a composite sort key
    - Example: PK = CUSTOMER#{CustomerId}
    - Examlpe: SK = #ORDER#{OrderId}
- For the customer item, we use sort key of 'A' to refer to the customer's primary record, or "A record"
    - This is an example of overloading the sort key: the sort key may either pertain to an 
      order or a customer
- Each item has a `Type` attribute. This is a good practice, and it is <u>required for this item collection querying strategy</u>
- We need the `OrderId` to be unique as well as chronologically sortable in order to support access pattern #3 below. 
  For simplicity, we use a date string in ISO format (e.g. 2020-12-06) rather than using a proper ordered 
  identifier like a KSUID or ULID. Read more about these here: 
  [Leveraging ULIDs to create order in unordered datastores](https://www.trek10.com/blog/leveraging-ulids-to-create-order-in-unordered-datastores).
- In order to support access pattern #3, we prefix the sort key for orders with `#`. By prefixing an order's 
  sort key with `#`, we ensure that the customer's A record comes lexicographically last, after
  all of the order items. Given this, we can tell DynamoDB to read items from "bottom to top" and access the customer
  along with their most recent N orders. So in the `SK` column of our example data in the table above, we start with the
  customer item (the last row in the table), and then work our way upward to the order with `SK=#ORDER#2020-12-06`,
  then to the order with `SK=#ORDER#2020-12-01`, and finally to the first row in the table, the order
  with `SK=#ORDER#2020-11-25`. If we only want the cusomter and their most
  recent order, we use `ScanForward=False` together with `Limit=2` (one customer item plus one order item for a 
  total of two items).

This supports the follow access patterns:

1. Get customer by id
1. Get customer and all their orders
1. Get customer and their most recent N orders
1. Get just the orders for a customer
   
We will focus on #3. We will use a DynamoDB `Query` to get the customer and their most recent order in a single request. 
The challenge here is not with querying the item collection but with marshalling the resulting heterogeneous items 
into their respective entity value classes.

That is because the Enhanced Client is based on the concept of a `TableSchema<T>`, which allows you to preform the 
full range DynamoDB operations (`GetItem`, `PutItem`, etc.) in an ORM sort of way. Example:

_**Note:** Full code available on [GitHub](https://github.com/helloworldless/dynamodb-java-sdk-v2)_

```java
// Set up DynamoDbEnhancedClient...
DynamoDbTable<Customer> customerTable = dynamoDbEnhancedClient.table("java-sdk-v2", TableSchema.fromClass(Customer.class));

Customer customer = new Customer();
customer.setId("123");
customerTable.putItem(customer);

Customer retrievedCustomer = customerTable.getItem(customer);
```

However, in `TableSchema<T>`, `T` represents a single, concrete entity, like `Customer.java` or `Order.java`. 
Typically, these entities are annotated with the Enhanced Client annotations such as 
`@DynamoDbBean` and `@DynamoDbPartitionKey` 
which allow the SDK to dynamically read the schema for the item, e.g. `TableSchema.fromClass(Customer.class)`. This 
breaks down with item collections where we want to query various types of entities in a single operation 
(in our case, a customer and one or more orders). So how can 
we handle this with the Enhanced Client?

For starters, we will need a `DynamoDbTable` for each entity in the item collection:

```java
DynamoDbTable<Customer> customerTable = dynamoDbEnhancedClient.table("java-sdk-v2", TableSchema.fromClass(Customer.class));
DynamoDbTable<Order> orderTable = dynamoDbEnhancedClient.table("java-sdk-v2", TableSchema.fromClass(Order.class));
```

Next we need a value class to represent the item collection:

```java
public class CustomerItemCollection {
    private Customer customer;
    private List<Order> orders = new ArrayList<>();

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public List<Order> getOrders() {
        return orders;
    }

    public void addOrder(Order order) {
        this.orders.add(order);
    }
}
```

With that, we're ready to query the item collection!

```java
CustomerItemCollection getCustomerItemCollection(String customerId) {
    AttributeValue customerPk = AttributeValue.builder().s(Customer.prefixedId(customerId)).build();
    var queryRequest = QueryRequest.builder()
        .tableName(TABLE_NAME)
        .keyConditionExpression("#pk = :pk") // Define aliases for the Attribute, '#pk' and the value, ':pk'
        .expressionAttributeNames(Map.of("#pk", "PK")) // '#pk' refers to the Attribute 'PK'
        .expressionAttributeValues(Map.of(":pk", customerPk)) // ':pk' refers to the customer PK of interest
        .build();

    // Use the DynamoDbClient directly rather than the DynamoDbEnhancedClient or DynamoDbTable
    QueryResponse queryResponse = dynamoDbClient.query(queryRequest);

    // The result is a list of items in a "DynamoDB JSON map"
    List<Map<String, AttributeValue>> items = queryResponse.items();

    var customerItemCollection = new CustomerItemCollection();

    for (Map<String, AttributeValue> item : items) {

        // Every item must have a 'Type' Attribute
        AttributeValue type = item.get("Type");
    
        // Switch on the 'Type' and use the respective TableSchema to marshall the DynamoDB JSON into the value class
        switch (type.s()) {
            case Customer.CUSTOMER_TYPE:
                Customer customer = customerTableSchema.mapToItem(item);
                customerItemCollection.setCustomer(customer);
                break;
            case Order.ORDER_TYPE:
                Order order = orderTableSchema.mapToItem(item);
                customerItemCollection.addOrder(order);
                break;
        }

    }
    
    return customerItemCollection;
}
```
