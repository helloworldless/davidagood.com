---
title: "Logging in Java: APIs, Implementations, Bridges, Log4j, JUL, Apache Commons Logging, SLF4J, Logback, Log4j2"
date: "2019-08-28T12:00:00.000Z"
description: Java logging reference. Work in progress. 
isExternal: false
externalUrl: https://medium.com/@davidagood/logging-in-java-apis-implementations-bridges-log4j-jul-slf4j-logback-ad33852c37a6
comment: relocated this from Medium to here 
---

Note: Rather than investing a lot of time up front in creating a complete and polished story, this will be a work in progress.

# Background

I won’t go into a lot of detail here on why logging in Java is so complicated,
 but I will provide a link under **Additional Reading** below which explains the history.

# Motivation

For many years, I was working on mostly small Java projects with a limited number of dependencies.
 They were mostly Spring projects or Spring Boot apps, so logging was pretty simple.
  With Spring Boot, I would add a Spring starter dependency,
   e.g. `org.springframework.boot:spring-boot-starter-logging`, and maybe create
    my own `logback.xml` file to customize the logging pattern that comes out of the box with Spring.

_I use the convention `<groupId>:<artifactId>` in this article to refer to dependencies._

But later, when I worked on larger projects and ones which didn’t use Spring, I started to see the ugly side of logging in Java. Most of what I learned about logging was through scouring the internet and plucking useful bits of information from forums and the like. Also, there was a lot of trial and error. But I’ve had some success and grown more confident in my knowledge of the topic, so I’m documenting what I’ve learned so that others may benefit from it (not to mention my future self). This is meant to be beginner friendly, but it should also be useful as a reference for advanced users.

# Logging Library Categories

## Implementations

Simply put these are what actually do the logging. If you’re new to the complexities of
 logging in Java, this is probably what a “logging library” means to you. Another way to
  think of it: the logging implementation is where you define the logging pattern
   (`2019–08–28T12:34:56.789Z [level=INFO] [thread=main] com.example.Service : Started - Requesting data from ...`),
    and each logging implementation has its own format and domain-specific language (DSL) which
     you use to define the format.
     
You should only have one logging implementation present in your
      project’s classpath (dependencies). If you have multiple implementations present in your
       project’s classpath, you’ll get a nasty warning like “multiple bindings present”. Also, you
        will likely see log events with different patterns.

Imagine that you did want to use multiple
         logging implementations. You would have to configure each one individually. You’d probably want
          the log pattern to be the same for both, so you’d have to duplicate the same pattern using two
           different DSLs. That would be terrible. Dealing with one implementation’s DSL is difficult enough.
            And it’s common for certain features to not be supported universally (e.g. Log4j doesn’t
             support “replace” which is typically done by providing a RegEx pattern and a replacement string).

Examples of Logging Implementations: Log4j, Log4j2, Logback, Java Util Logging (JUL)

## APIs

Logging APIs are used in conjunction with a logging implementation. The most popular API is
 SLF4J (Simple Logging Facade for Java). Notice the term “facade” — this should help cement
  the idea that you can’t use it without being backed by a logging implementation. APIs are important
   because they allow you to write your code with proper logging without being coupled to any one logging
    implementation. Ideally, the libraries you use are also using an API like SLF4J. So you as the consumer
     of those libraries and the owner of your project get to chose your own logging implementation. And just
      as modular software design encourages you to code to an interface, not to an implementation, using a logging
       API allows you to change logging implementations at any time with very little effort — just swap the dependency
        and add the necessary config for the new implementation.
        
Another less common API is Apache Commons Logging
         which describes itself as “an ultra-thin bridge between different logging implementations” ([source](https://commons.apache.org/proper/commons-logging/)).

## Bridges

You may come across a legacy dependency which use the Log4j or Java Util Logging (JUL) implementations directly
 rather than using a logging API. But you as the owner of your project want to chose your own, modern logging
  implementation like Logback. You shouldn’t be forced to use another logging implementation just because a dependency
   uses it. And the good new is, you don’t have to.

So for example, if you need to use a dependency which is using Log4j directly (i.e. the dependency has a transitive
 dependency on Log4j), you can use `log4j-over-slf4j` which, “allows log4j users to migrate existing applications
  to SLF4J without changing a single line of code but simply by replacing [log4j] with [log4j-over-slf4j]”
   ([source](https://www.slf4j.org/legacy.html#log4j-over-slf4j)). In other words, you add `log4j-over-slf4j` as a
    dependency to your project add an exclusion to prevent the transitive dependency from bringing Log4j into your
     project’s classpath. Once this is done you can use the logging implementation of your choosing.

# Additional Reading

The State of Logging in Java: https://stackify.com/logging-java/