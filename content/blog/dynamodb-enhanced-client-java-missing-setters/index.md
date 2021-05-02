---
title: "DynamoDB Enhanced Client for Java: Missing Setters Cause Misleading Error or Unexpected Behavior" 
date: "2020-12-01T01:30:00.000Z"
updatedAt: "2021-01-19T15:29:32.487Z"
description: "The AWS SDK v2 for Java's DynamoDB Enhanced Client requires setters for every attribute. Missing the 
setter for a given attribute may cause a misleading exception or the attribute being silently ignored."
---

# Problem

When using the AWS SDK v2 for Java's DynamoDB Enhanced Client, you're getting one of these exceptions:

- `IllegalArgumentException: Attempt to execute an operation that requires a primary index without 
defining any primary key attributes in the table metadata`
- `IllegalArgumentException: Attempt to execute an operation against an index that requires a partition key 
without assigning a partition key to that index. Index name: $PRIMARY_INDEX`
- `IllegalArgumentException: A sort key value was supplied for an index that does not support one. 
  Index: $PRIMARY_INDEX`

# Solution

Make sure every DynamoDB attribute on your entity has a publicly-accessible setter with the same name (case-sensitive)
as the getter.

For example, if your entity has a `userName` attribute  with a getter:

```java
public String getUserName() { 
    return this.userName; 
}
```

...then it must also have a matching setter which is publicly accessible:

```java
public void setUserName(String userName) { 
    this.userName = userName; 
}
```

Similarly, if you have a getter for a static sort key like this:

```text
@DynamoDbSortKey
@DynamoDbAttribute("SK")
public String getSortKey() {
    return "A";
}
```

...you must have a corresponding, publicly-accessible setter like this:

```text
public void setSortKey(String sortKey) {
    // Do nothing, this is a derived attribute
}
```


# Details

In order for the AWS SDK v2 for Java's Enhanced Client to detect an attribute on a `@DynamoDbBean`, the field 
must have a setter. In other words, just having a getter is not enough, even for derived attributes. This may 
or may not be obvious, but forgetting the setter for an attribute can result in a misleading error, or the attribute 
being silently ignored as we will see below.

For example, consider this DynamoDB bean:

```java
import lombok.Data;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

@DynamoDbBean
@Data
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
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;

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
        this.dynamoDbClient = DynamoDbClient.builder()
                .region(Region.US_EAST_1)
                .build();
        this.dynamoDbEnhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();
        this.customerTable = 
                dynamoDbEnhancedClient.table(
                        "MyTable", TableSchema.fromClass(Customer.class));
    }

    public void saveCustomer(Customer customer) {
       this.customerTable.putItem(customer);
    }

}
```

Running this code with fail with the following error:

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
import lombok.Data;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

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

But that's not all. Suppose you don't add a setter for a non-primary key attribute, say, a derived attribute like Type:

```java
import lombok.Data;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;

@DynamoDbBean
@Data
public class Customer {

    // Primary key attributes omitted
  
    @DynamoDbAttribute("Type")
    public String getType() {
        return "Customer";
    }

}
```

In this case, the SDK will silently ignore the Type attribute, and it will not be persisted at all. Just like we saw
above, to fix this, we must add a complimentary setter for every attribute, even for derived attributes where the
setter does nothing:

```java
import lombok.Data;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;

@DynamoDbBean
@Data
public class Customer {

    // Primary key attributes omitted
  
    @DynamoDbAttribute("Type")
    public String getType() {
        return "Customer";
    }

    public void setType(String type) {
      // Do nothing, this is a derived attribute
    }
}
```


# Detailed Exception Messages and Stack Traces

I noticed the slightly different exception messages depending on which attribute was missing the 
public-accessible setter, so I'm detailing them all here.

If there is no publicly-accessible setter for the partition key:

```text
java.lang.IllegalArgumentException: Attempt to execute an operation against an index that requires a partition key without assigning a partition key to that index. Index name: $PRIMARY_INDEX
  at software.amazon.awssdk.enhanced.dynamodb.mapper.StaticTableMetadata.indexPartitionKey(StaticTableMetadata.java:86)
  at software.amazon.awssdk.enhanced.dynamodb.TableMetadata.primaryPartitionKey(TableMetadata.java:121)
  at software.amazon.awssdk.enhanced.dynamodb.internal.operations.CreateTableOperation.generateRequest(CreateTableOperation.java:64)
  at software.amazon.awssdk.enhanced.dynamodb.internal.operations.CreateTableOperation.generateRequest(CreateTableOperation.java:43)
  at software.amazon.awssdk.enhanced.dynamodb.internal.operations.CommonOperation.execute(CommonOperation.java:113)
  at software.amazon.awssdk.enhanced.dynamodb.internal.operations.TableOperation.executeOnPrimaryIndex(TableOperation.java:59)
  at software.amazon.awssdk.enhanced.dynamodb.internal.client.DefaultDynamoDbTable.createTable(DefaultDynamoDbTable.java:97)
  at software.amazon.awssdk.enhanced.dynamodb.internal.client.DefaultDynamoDbTable.createTable(DefaultDynamoDbTable.java:104)
  at com.davidagood.awssdkv2.dynamodb.repository.DynamoDbIntegrationTest.createTable(DynamoDbIntegrationTest.java:21)
```

If there is no publicly-accessible setter for the sort key:

```text
java.lang.IllegalArgumentException: A sort key value was supplied for an index that does not support one. Index: $PRIMARY_INDEX
  at software.amazon.awssdk.enhanced.dynamodb.Key.lambda$keyMap$0(Key.java:70)
  at java.base/java.util.Optional.orElseThrow(Optional.java:408)
  at software.amazon.awssdk.enhanced.dynamodb.Key.keyMap(Key.java:69)
  at software.amazon.awssdk.enhanced.dynamodb.internal.operations.GetItemOperation.generateRequest(GetItemOperation.java:70)
  at software.amazon.awssdk.enhanced.dynamodb.internal.operations.GetItemOperation.generateRequest(GetItemOperation.java:35)
  at software.amazon.awssdk.enhanced.dynamodb.internal.operations.CommonOperation.execute(CommonOperation.java:113)
  at software.amazon.awssdk.enhanced.dynamodb.internal.operations.TableOperation.executeOnPrimaryIndex(TableOperation.java:59)
  at software.amazon.awssdk.enhanced.dynamodb.internal.client.DefaultDynamoDbTable.getItem(DefaultDynamoDbTable.java:138)
  at software.amazon.awssdk.enhanced.dynamodb.internal.client.DefaultDynamoDbTable.getItem(DefaultDynamoDbTable.java:145)
  at software.amazon.awssdk.enhanced.dynamodb.internal.client.DefaultDynamoDbTable.getItem(DefaultDynamoDbTable.java:150)
  at com.davidagood.awssdkv2.dynamodb.repository.DynamoDbRepository.getCustomerById(DynamoDbRepository.java:161)
  at com.davidagood.awssdkv2.dynamodb.repository.DynamoDbIntegrationTest.insertAndRetrieveCustomer(DynamoDbIntegrationTest.java:36)
```

If the partition key and sort key setters are both missing or both not publicly accessible:

```text
java.lang.IllegalArgumentException: Attempt to execute an operation that requires a primary index without defining any primary key attributes in the table metadata.
  at software.amazon.awssdk.enhanced.dynamodb.mapper.StaticTableMetadata.getIndex(StaticTableMetadata.java:141)
  at software.amazon.awssdk.enhanced.dynamodb.mapper.StaticTableMetadata.indexPartitionKey(StaticTableMetadata.java:78)
  at software.amazon.awssdk.enhanced.dynamodb.TableMetadata.primaryPartitionKey(TableMetadata.java:121)
  at software.amazon.awssdk.enhanced.dynamodb.internal.operations.CreateTableOperation.generateRequest(CreateTableOperation.java:64)
  at software.amazon.awssdk.enhanced.dynamodb.internal.operations.CreateTableOperation.generateRequest(CreateTableOperation.java:43)
  at software.amazon.awssdk.enhanced.dynamodb.internal.operations.CommonOperation.execute(CommonOperation.java:113)
  at software.amazon.awssdk.enhanced.dynamodb.internal.operations.TableOperation.executeOnPrimaryIndex(TableOperation.java:59)
  at software.amazon.awssdk.enhanced.dynamodb.internal.client.DefaultDynamoDbTable.createTable(DefaultDynamoDbTable.java:97)
  at software.amazon.awssdk.enhanced.dynamodb.internal.client.DefaultDynamoDbTable.createTable(DefaultDynamoDbTable.java:104)
  at com.davidagood.awssdkv2.dynamodb.repository.DynamoDbIntegrationTest.createTable(DynamoDbIntegrationTest.java:21)
```