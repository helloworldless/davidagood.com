---
title: DynamoDB Data Modeling
date: "2020-10-19T15:05:49.782Z"
description: "A work in progress: open questions, lessons learned, tips, etc. 
from data modeling for DynamoDB"
---

_This is a work in progress (digital garden style!): open questions, 
lessons learned, tips, etc. from data modeling for DynamoDB._

# Item Collection Data Modeling Example

An item collection refers to all the items with the same partition key. For example, here's an item collection
formed of a customer and their orders. This example is originally from 
[this post](https://www.davidagood.com/dynamodb-enhanced-client-java-heterogeneous-item-collections/).

PK | SK | Type | CustomerId | OrderId
---|----|------|------------|--------
CUSTOMER#123|#ORDER#2020-11-25|Order|123|2020-11-25
CUSTOMER#123|#ORDER#2020-12-01|Order|123|2020-12-01
CUSTOMER#123|#ORDER#2020-12-06|Order|123|2020-12-06
CUSTOMER#123|A|Customer|123|

## Observations

#### Generic Primary Key Names

The primary keys (partition key and sort key), use generic names, `PK` and `SK`, as they may be overloaded
with various types of values as we will see below

#### Prefixed Primary Keys

We use a prefix for the partition key to differentiate this from other types of entities which may live in the
same table. Example: `PK = CUSTOMER#{CustomerId}`.

We also use a prefix for the sort key for the same reason. Example: `SK = #ORDER#{OrderId}`. We discuss the preceding
`#` below.

The sort key prefix can also be used with DynamoDB's
[Comparison Operators](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html)
so we could search for all items with a certain partition key and where the sort key begins with a certain string,
for example, where the sort key beings with `#ORDER#`.

#### Customer A Record

For the primary customer item, we use sort key of `A` to refer to the customer's primary record, or "A record".
This is an example of overloading the sort key: the sort key may either pertain to an order or a customer

#### Type Attribute

Each item has a `Type` attribute. This is a good practice,
and it is a requirement for this item collection querying strategy described 
in this post: 
[Working with Heterogeneous Item Collections in the DynamoDB Enhanced Client for Java](https://www.davidagood.com/dynamodb-enhanced-client-java-heterogeneous-item-collections/).

#### Lexicographically Sorted OrderId

We need the `OrderId` to be unique as well as chronologically sortable in order to support access patterns
such as getting the customer and the newest N orders.
For simplicity, we use a date string in ISO format (e.g. 2020-12-06) rather than using a proper ordered
identifier like a KSUID or ULID. Read more about these here:
[Leveraging ULIDs to create order in unordered datastores](https://www.trek10.com/blog/leveraging-ulids-to-create-order-in-unordered-datastores).

#### OrderId '#' Prefix

In order to support access patterns such as getting the customer and the newest N orders, 
we prefix the sort key for orders with `#`. By prefixing an order's
sort key with `#`, we ensure that the customer sort key `A` comes lexicographically last, after
all of the order items' sort keys. Given this, we can tell DynamoDB to read items from "bottom to top"
and access the customer
along with their most recent N orders. So in our table of example data above, we start with the
customer item (SK = `A`) which is the last row in the table,
and then work our way upwards to the order with `SK=#ORDER#2020-12-06`,
then to the order with `SK=#ORDER#2020-12-01`, and finally to the first row in the table, the order
with `SK=#ORDER#2020-11-25`. If we only want to query the cusomter and their most
recent order, we use `ScanForward=False` together with `Limit=2` (one customer item plus one order item for a
total of two items).


# Open Questions / Scratch

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
