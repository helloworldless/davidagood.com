---
title: "A Pattern for Enums in Go"
date: "2021-09-05T05:14:00.000Z"
---

I'm sure I'm not alone, being new to Go and missing 
first-class support for enums. I do see there's an 
enum proposal for Go v2, so at least this is recognized 
as a shortcoming with an improvement on the way.

Here's a super lightweight pattern I found useful after 
doing my first few weeks of serious feature development 
in Golang.


```go

type State string

const (
    Init State = "Init"
    InProgress State = "InProgress"
    Succeeded State = "Succeeded"
    Failed State = "Failed"
)

func (s *State) IsValid() bool {
    switch s {
    case Init, InProgress, Success, Failure:
        return true
    default:
        return false
    }
}
```

There are still downsides like having to repeat the 
name and value in the declaration, having to update `IsValid` 
if a new value is added to the enum, and of course, having 
to actually call `IsValid` on any untrusted input.

I also like to throw this in for ease of use:

```go
package mypackage

var States = struct {
    Init State
    InProgress State
    Succeeded State
    Failed State
}{
    Init: Init
    InProgress: InProgress
    Succeeded: Succeeded
    Failed: Failed
}
```

This adds even more repetition, but I find it much more familiar coming from a 
Java background. When I'm coding, I might not know the enum value I want to use 
off the top of my head, so I just type `mypackage.States.` and let my IDE show 
me all the possible values. Presumably my IDE should infer the type and show me 
all the possible values without having to use this "trick". I have spent enough 
time writing go (with IntelliJ) to know if it does.

The standard library takes a different approach, 
instead moving the repetition to a prefix, e.g. 
`HttpStatusOk`, `HttpStatusBadRequest`, etc. This approach (using a 
common prefix) actually namespaces the values, so it would prevent collisions. 
My approach does not.

Use it like this:

```go
func doSomething(o ObjectWithState) error {
    if !o.state.IsValid() {
        return fmt.Errof("invalid state value: %s", o.state)
    }
    if o.state == mypackage.States.InProgress {
        // whatever
    }
}
```

As I'm writing this, I'm wondering if this 
helper struct is even worth it. I'm sure my approach 
will evolve over time...
