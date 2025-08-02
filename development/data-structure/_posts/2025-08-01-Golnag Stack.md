---
title: "Golang Stack"
categories:
  - development
  - data-structure
tags:
  - Golang
  - 자료구조
last_modified_at: 2025-08-01
toc: true
---

## Stack

Last-In First-Out 형태의 자료구조

해당 문서에서 구현할 Stack은 Linked List를 기반으로 구현

Array 기반으로 구현할 때보다 top을 제외한 내용에 대한 읽기가 느리지만 Push, Pop이 빠르다

### Linked List Node

```go
type Node struct {
  value int
  prev  *Node
  next  *Node
}

func NewNode(_value int) *Node {
  return &Node{
    value: _value,
    prev:  nil,
    next:  nil,
  }
}
```

### Stack Struct

```go
type Stack struct {
  top *Node
}

func NewStack() *Stack {
  return &Stack{
    top: nil,
  }
}

func (s *Stack) IsEmpty() bool {
  return s.top == nil
}
```

### Push

```go
func (s *Stack) Push(value int) {
  newNode := NewNode(value)

  if !s.IsEmpty() {
    s.top.next = newNode
    newNode.prev = s.top
  }

  s.top = newNode
}
```

### Pop

```go
func (s *Stack) Pop() int {
  if s.IsEmpty() {
    return -1 
  }

  popNode := s.top
  s.top = popNode.prev
  if s.top != nil {
    s.top.next = nil
  }

  return popNode.value
}
```
