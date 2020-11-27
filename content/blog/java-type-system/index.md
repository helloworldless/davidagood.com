---
title: Java Type System
date: "2020-11-27T00:26:09.295Z"
description: "A work in progress: open questions, lessons learned, tips, etc. 
from working with the Java type system"
---

_This is a work in progress (digital garden style!): open questions, 
lessons learned, tips, etc. from working with the Java type system._

# TypeVariable

The [Javadoc](https://docs.oracle.com/en/java/javase/15/docs/api/java.base/java/lang/reflect/TypeVariable.html) 
doesn't explain much, although it does reference [Chapter 5. Conversions and Contexts](https://docs.oracle.com/javase/specs/jls/se15/html/jls-5.html) 
of the Java spec. A bit of research reveals that `TypeVariable` is referring to a type parameter, so 
in the following code snippet the `TypeVariable` is `String`:
 
```
List<String> words;
```

# Super Type Tokens aka Gafter's Gadget

http://gafter.blogspot.com/2006/12/super-type-tokens.html
