---
title: DynamoDB Data Modeling
date: "2020-10-19T15:05:49.782Z"
description: "A work in progress: open questions, lessons learned, tips, etc. 
from working with DynamoDB, specifically with Java"
---

_This is a work in progress (digital garden style!): open questions, 
lessons learned, tips, etc. from working with DynamoDB, specifically with Java._

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