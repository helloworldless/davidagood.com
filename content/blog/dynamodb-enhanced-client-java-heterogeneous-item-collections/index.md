---
title: "Working with Heterogeneous Item Collections in the DynamoDB Enhanced Client for Java" 
date: "2020-12-07T01:51:34.815Z"
description: "Working with heterogeneous item collections with the Java SDKs can be tricky. Here we see how to handle 
them with the AWS SDK v2 for Java's Enhanced Client."
---

Item collections are a core concept in DynamoDB, especially for "well-designed" applications using a single table 
design. However, this concept doesn't have first class support in the SDKs. In this post, I demonstrate a 
strategy for querying heterogeneous item collections with the 
[AWS SDK v2 for Java's Enhanced Client](https://github.com/aws/aws-sdk-java-v2/tree/master/services-custom/dynamodb-enhanced).

## Item Collection Data Model

Here's an item collection formed of a customer and their orders. This is the main dataset we will use 
throughout this post. I've explained the details of this single-table data model 
[here](https://www.davidagood.com/dynamodb-data-modeling/).

PK | SK | Type | CustomerId | OrderId*
---|----|------|------------|--------
CUSTOMER#123|#ORDER#2020-11-25|Order|123|2020-11-25
CUSTOMER#123|#ORDER#2020-12-01|Order|123|2020-12-01
CUSTOMER#123|#ORDER#2020-12-06|Order|123|2020-12-06
CUSTOMER#123|A|Customer|123|

*We use an ISO-formatted date as a simple, chronologically ordered identifier

## Access Patterns

The data model shown above supports the following access patterns:

1. Get customer by id
1. Get customer and all their orders
1. Get customer and their most recent N orders
1. Get just the orders for a customer
   
We will focus on #3. We will use a DynamoDB `Query` to get the customer and their most recent order in a single request. 
The challenge here is not with querying the item collection but with marshalling the resulting items 
into their respective value classes.

That is because the Enhanced Client is based on the concept of a `DynamoDbTable<T>`, which allows you to preform the 
full range DynamoDB operations (`GetItem`, `PutItem`, etc.) in an ORM sort of way. Example:

_**Note:** The full code from these examples is available on [GitHub](https://github.com/helloworldless/dynamodb-java-sdk-v2)_

```java
// Set up DynamoDbEnhancedClient...
DynamoDbTable<Customer> customerTable = 
        dynamoDbEnhancedClient.table(
                TABLE_NAME, TableSchema.fromClass(Customer.class));

Customer customer = new Customer();
customer.setId("123");
customerTable.putItem(customer);

Customer retrievedCustomer = customerTable.getItem(customer);
```

In `DynamoDbTable<T>`, `T` represents a single, concrete entity, like `Customer.java` or `Order.java`. 
These entities are typically `@DynamoDbBean`-annotated value classes which use other Enhanced Client annotations such 
as `@DynamoDbPartitionKey`, `@DynamoDbSortKey`, and `@DynamoDbAttribute`.  
These annotations allow the SDK to dynamically read the schema for the item, 
e.g. `TableSchema.fromClass(Customer.class)` and in turn create the table abstraction, `DynamoDbTable<Customer>`. 

However, the `DynamoDbTable<T>` abstraction 
breaks down with heterogeneous item collections where we want to query various types of entities in a single operation 
(in our case, a customer and one or more orders). So how can 
we handle this with the Enhanced Client?

For starters, we will need a `DynamoDbTable` for each entity in the item collection 
_even though all the items are in the same DynamoDB table_:

```java
DynamoDbTable<Customer> customerTable = 
        dynamoDbEnhancedClient.table(
                TABLE_NAME, TableSchema.fromClass(Customer.class));
DynamoDbTable<Order> orderTable = 
        dynamoDbEnhancedClient.table(
                TABLE_NAME, TableSchema.fromClass(Order.class));
```

Next we need a value class which represents the item collection:

```java
public class CustomerItemCollection {
    private Customer customer;
    private List<Order> orders = new ArrayList<>();

    public Customer getCustomer() {
        return this.customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public List<Order> getOrders() {
        return this.orders;
    }

    public void addOrder(Order order) {
        this.orders.add(order);
    }
}
```

With that, we're ready to query the item collection!

```java
CustomerItemCollection getCustomerAndRecentOrders(String customerId, 
                                                 int newestOrdersCount) {
    AttributeValue customerPk = AttributeValue.builder()
        .s(Customer.prefixedId(customerId))
        .build();
    var queryRequest = QueryRequest.builder()
        .tableName(TABLE_NAME)
        // Define aliases for the Attribute, '#pk' and the value, ':pk'
        .keyConditionExpression("#pk = :pk")
        // '#pk' refers to the Attribute 'PK'
        .expressionAttributeNames(Map.of("#pk", "PK"))
        // ':pk' refers to the customer PK of interest
        .expressionAttributeValues(Map.of(":pk", customerPk))
        // Search from "bottom to top"
        .scanIndexForward(false)
        // One customer, plus N newest orders
        .limit(1 + newestOrdersCount)
        .build();

    // Use the DynamoDbClient directly rather than the
    // DynamoDbEnhancedClient or DynamoDbTable
    QueryResponse queryResponse = dynamoDbClient.query(queryRequest);

    // The result is a list of items in a "DynamoDB JSON map"
    List<Map<String, AttributeValue>> items = queryResponse.items();

    var customerItemCollection = new CustomerItemCollection();

    for (Map<String, AttributeValue> item : items) {

        // Every item must have a 'Type' Attribute
        AttributeValue type = item.get("Type");
    
        // Switch on the 'Type' and use the respective TableSchema 
        // to marshall the DynamoDB JSON into the value class
        switch (type.s()) {
            case Customer.CUSTOMER_TYPE:
                Customer customer = 
                    customerTableSchema.mapToItem(item);
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

Here's how we use it: 

```java
CustomerItemCollection customerItemCollection =
        app.getCustomerAndRecentOrders(CUSTOMER_ID, 1)
System.out.println("Result of query item collection: " + 
        customerItemCollection);
```

The output is:

```text
Result of query item collection: CustomerItemCollection{
      customer=
        Customer{
          id=123, 
          PK=CUSTOMER#123, 
          SK=A, 
          Type=Customer
        }, 
      orders=[
        Order{
            id=2020-12-06, 
            customerId=123, 
            PK=CUSTOMER#123, 
            SK=#ORDER#2020-12-06, 
            Type=Order
        }
      ]
}
```

See the full code from these examples on [GitHub](https://github.com/helloworldless/dynamodb-java-sdk-v2).
