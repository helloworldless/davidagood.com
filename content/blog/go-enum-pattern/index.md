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
    Success State = "Success"
    Failure State = "Failure"
)

func (s *State) IsValid() book {
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
