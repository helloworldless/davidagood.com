---
title: DynamoDB Data Modeling
date: "2020-10-19T15:05:49.782Z"
description: "A work in progress: open questions, lessons learned, tips, etc. 
from working with DynamoDB, specifically with Java"
---

_This is a work in progress (digital garden style!): open questions, 
lessons learned, tips, etc. from working with DynamoDB, specifically with Java._

# AWS SDK v2 Java

## Feature Requests

- [DynamoDB Enhanced Client: Support Querying and Marshalling Heterogeneous Item Collections](https://github.com/aws/aws-sdk-java-v2/issues/2151)
    - Once I understand the SDK codebase better, I would ideally like to contribute this myself
- [DynamoDB Enhanced Client: Provide JSON Attribute Converter Out of the Box](https://github.com/aws/aws-sdk-java-v2/issues/2162)
    - Working on this myself
- [Enhanced DynamoDB annotations are incompatible with Lombok](https://github.com/aws/aws-sdk-java-v2/issues/1932#issuecomment-733174524)
    - Specifically, I added onto this features request to support derived fields on immutable value class entities
    
## Gotchas

### Missing Setters on @DynamoDbBean

In order for the AWS SDK v2 for Java's Enhanced Client to detect an attribute on a `@DynamoDbBean`, the field 
must have a setter. In other words, just having a getter is not enough, even for derived attributes. This may 
or may not be obvious, but forgetting the setters results in a cryptic error as we will see below.

For example, consider this DynamoDB bean:

```java
@DynamoDbBean
@Data // Lombok
public class Customer {

    private String id;

    @DynamoDbPartitionKey
    @DynamoDbAttribute("PK")
    public String getPartitionKey() {
        return "CUSTOMER#" + this.id;
    }

    @DynamoDbSortKey
    @DynamoDbAttribute("SK")
    public String getSortKey() {
        return "A";
    }

}
```

...and this sample application code:

```java
public class App {

    private final DynamoDbClient dynamoDbClient;
    private final DynamoDbEnhancedClient dynamoDbEnhancedClient;
    private final DynamoDbTable<Customer> customerTable;

    public static void main(String[] args) {
        App app = new App();
        Customer customer = new Customer("123", "ABC");
        app.saveCustomer(customer);
    }

    public App() {
        this.dynamoDbClient = DynamoDbClient.builder().region(Region.US_EAST_1).build();
        this.dynamoDbEnhancedClient = DynamoDbEnhancedClient.builder().dynamoDbClient(dynamoDbClient).build();
        this.customerTable = dynamoDbEnhancedClient.table("MyTable", TableSchema.fromClass(Customer.class));
    }

    public void saveCustomer(Customer customer) {
       this.customerTable.putItem(customer);
    }

}
```

Running this code with fail with the following cryptic error:

```text
java.lang.IllegalArgumentException: Attempt to execute an operation that requires a primary index without defining any primary key attributes in the table metadata.
	at software.amazon.awssdk.enhanced.dynamodb.mapper.StaticTableMetadata.getIndex(StaticTableMetadata.java:141)
	at software.amazon.awssdk.enhanced.dynamodb.mapper.StaticTableMetadata.indexPartitionKey(StaticTableMetadata.java:78)
	at software.amazon.awssdk.enhanced.dynamodb.TableMetadata.primaryPartitionKey(TableMetadata.java:121)
	at software.amazon.awssdk.enhanced.dynamodb.internal.operations.PutItemOperation.generateRequest(PutItemOperation.java:68)
	at software.amazon.awssdk.enhanced.dynamodb.internal.operations.PutItemOperation.generateRequest(PutItemOperation.java:40)
	at software.amazon.awssdk.enhanced.dynamodb.internal.operations.CommonOperation.execute(CommonOperation.java:113)
	at software.amazon.awssdk.enhanced.dynamodb.internal.operations.TableOperation.executeOnPrimaryIndex(TableOperation.java:59)
	at software.amazon.awssdk.enhanced.dynamodb.internal.client.DefaultDynamoDbTable.putItem(DefaultDynamoDbTable.java:179)
	at software.amazon.awssdk.enhanced.dynamodb.internal.client.DefaultDynamoDbTable.putItem(DefaultDynamoDbTable.java:187)
	at com.davidagood.dynamo.v2.App.saveCustomer(App.java:49)
	at com.davidagood.dynamo.v2.App.main(App.java:31)
```

If we inspect the `TableSchema`, we notice it's not picking up any metadata (`tableMetadata`) on the `@DynamoDbBean`:

```text
this.customerTable = {DefaultDynamoDbTable@4371} 
 dynamoDbClient = {DefaultDynamoDbClient@2584} 
 extension = {VersionedRecordExtension@4390} 
 tableSchema = {BeanTableSchema@4391} 
  delegateTableSchema = {StaticTableSchema@4393} 
   delegateTableSchema = {StaticImmutableTableSchema@4394} 
    attributeMappers = {Collections$UnmodifiableRandomAccessList@4395}  size = 1
    newBuilderSupplier = {LambdaToMethodBridgeBuilder$lambda@4396} 
    buildItemFunction = {Function$lambda@4397} 
    indexedMappers = {Collections$UnmodifiableMap@4398}  size = 1
    tableMetadata = {StaticTableMetadata@4399} 
     customMetadata = {Collections$UnmodifiableMap@4410}  size = 0
     indexByNameMap = {Collections$UnmodifiableMap@4411}  size = 0
     keyAttributes = {Collections$UnmodifiableMap@4412}  size = 0
```

To fix this, we must add setters for the partition key and sort key as follows:

```java
@DynamoDbBean
@Data
public class Customer {

    private String id;

    @DynamoDbPartitionKey
    @DynamoDbAttribute("PK")
    public String getPartitionKey() {
        return "CUSTOMER#" + this.id;
    }

    public void setPartitionKey(String partitionKey) {
        // Do nothing, this is a derived attribute
    }

    @DynamoDbSortKey
    @DynamoDbAttribute("SK")
    public String getSortKey() {
        return "A";
    }

    public void setSortKey(String sortKey) {
        // Do nothing, this is a derived attribute
    }

}
```

Now if we run the application it will work as expected, and if we inspect the `TableSchema`, we see 
the expected `tableMetadata`:

```text
this.customerTable = {DefaultDynamoDbTable@4381} 
 dynamoDbClient = {DefaultDynamoDbClient@2614} 
 extension = {VersionedRecordExtension@4400} 
 tableSchema = {BeanTableSchema@4401} 
  delegateTableSchema = {StaticTableSchema@4403} 
   delegateTableSchema = {StaticImmutableTableSchema@4404} 
    attributeMappers = {Collections$UnmodifiableRandomAccessList@4405}  size = 3
    newBuilderSupplier = {LambdaToMethodBridgeBuilder$lambda@4406} 
    buildItemFunction = {Function$lambda@4407} 
    indexedMappers = {Collections$UnmodifiableMap@4408}  size = 3
    tableMetadata = {StaticTableMetadata@4409} 
     customMetadata = {Collections$UnmodifiableMap@4415}  size = 0
     indexByNameMap = {Collections$UnmodifiableMap@4416}  size = 1
      "$PRIMARY_INDEX" -> {StaticIndexMetadata@4430} 
     keyAttributes = {Collections$UnmodifiableMap@4417}  size = 2
      "PK" -> {StaticKeyAttributeMetadata@4423} 
      "SK" -> {StaticKeyAttributeMetadata@4425} 
```

# Other

How big is too big for an item collection?

One to many-to-many - remodel as one-to-one + one-to-many, 
eg. Customer to many appointments to many employees, instead appointment to one 
customer and appointment to many employees.

Saving an appointment, needing to check if a customer item exists first, 
this seems odd.

At what point do you make an entity a first class entity vs just embedding it 
in a parent entity, like pk=appointmentid, sk=customerid vs pk=customerid, sk=customerid 
vs having the customer entity embedded (document or individual attributes) in the 
parent entity: pk=appointmentid, sk=appointmentid. With all three options you can still have a GSI with gsipk=customerid, gsisk=appointmentid

Child entity being in the parent item collection vs not and then joining in a GSI, 
eg pk=appointmentid, sk=appointmentid and pk=appointmentid, sk=employeeid 
vs pk=appointmentid, sk=appointmentid and pk=appointmentid#employeeid, sk=appointmentid#employeeid

Creating a {Entity}ItemCollection value class

How should updates to multiple entities in an item collection be handled? 
Presumably with a batch transaction, or should updates to multiple entities in an 
item collection be avoided entirely?

## Different SDKs

Beware of different SDKs especially when researching issues, e.g. before digging 
into documentation, check which SDK or which version it is for.

For example, for NodeJS and Python, there are older, lower-level SDKs which require you 
to write DynamoDB JSON, like `{'Name': {'S': 'Jack}}`,  and a newer SDK which takes 
care of the datatype "wrapping" for you so you can just write: `{'Name': 'Jack'}`

Also, for Java there are many SDKS and other official libraries: 

- Java SDK v1
- Java SDK v2
- DynamoDBMapper

Watch out for transactional operations as well. They have their own classes, like `Get` and `Put`
