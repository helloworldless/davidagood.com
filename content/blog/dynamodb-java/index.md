---
title: Using DynamoDB with Java
date: "2020-12-01T01:30:00.000Z"
description: "A work in progress: open questions, lessons learned, tips, etc. 
from working with DynamoDB and Java"
---

_This is a work in progress (digital garden style!): open questions, 
lessons learned, tips, etc. from working with DynamoDB, specifically with Java._

# Different SDKs

Below are the official SDKs and clients available for Java. Beware of 
different SDKs especially when researching issues, e.g. before digging 
into documentation, check which SDK or which version it is for.
 
- AWS SDK for Java v2
    - [GitHub](https://github.com/aws/aws-sdk-java-v2)
    - [AWS SDK for Java 2.x Developer Guide](https://docs.aws.amazon.com/sdk-for-java/v2/developer-guide/welcome.html)
- Enhanced Client for v2 SDK
    - [GitHub](https://github.com/aws/aws-sdk-java-v2/tree/master/services-custom/dynamodb-enhanced)
- AWS SDK for Java v1
    - [GitHub](https://github.com/aws/aws-sdk-java)
    - [Set up the AWS SDK for Java](https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/setup-install.html)
- DynamoDBMapper for v1 SDK
    - [Developer Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBMapper.html)
    - [GitHub](https://github.com/aws/aws-sdk-java/blob/master/aws-java-sdk-dynamodb/src/main/java/com/amazonaws/services/dynamodbv2/datamodeling/DynamoDBMapper.java)

Watch out for transactional operations as well. They have their own classes, like `Get` and `Put`

Just as with Java, NodeJS and Python have older, lower-level SDKs which require you 
to write DynamoDB JSON, like `{'Name': {'S': 'Jack}}`, and newer SDKs which take 
care of the datatype "wrapping" for you so you can just write: `{'Name': 'Jack'}`

# AWS SDK v2 Java

## Feature Requests

- [DynamoDB Enhanced Client: Support Querying and Marshalling Heterogeneous Item Collections](https://github.com/aws/aws-sdk-java-v2/issues/2151)
    - Once I understand the SDK codebase better, I would ideally like to contribute this myself
- [DynamoDB Enhanced Client: Provide JSON Attribute Converter Out of the Box](https://github.com/aws/aws-sdk-java-v2/issues/2162)
    - Working on this myself
- [Enhanced DynamoDB annotations are incompatible with Lombok](https://github.com/aws/aws-sdk-java-v2/issues/1932#issuecomment-733174524)
    - Specifically, I added onto this feature request to support derived fields on immutable value class entities
    
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
