---
title: "Golang Queue"
categories:
  - development
  - data-structure
tags:
  - Golang
  - 자료구조
last_modified_at: 2025-08-02
toc: true
---

## Queue

First-In First-Out 형태의 자료구조

해당 문서에서 구현할 Queue은 Linked List를 기반으로 구현

Array 기반으로 구현할 때보다 front와 rear를 제외한 내용에 대한 읽기가 느리지만 Enqueue, Dequeue이 빠르다

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

### Queue Struct

```go
type Queue struct {
	front *Node
	rear  *Node
}

func NewQueue() *Queue {
	return &Queue{
		front: nil,
		rear:  nil,
	}
}

func (q *Queue) IsEmpty() bool {
	return q.front == nil
}
```

### Enqueue

```go
func (q *Queue) Enqueue(value int) {
	node := NewNode(value)

	if q.IsEmpty() {
		q.front = node
	} else {
		q.rear.next = node
	}

	q.rear = node
}
```

### Dequeue

```go
func (q *Queue) Dequeue() int {
	if q.IsEmpty() {
		return -1
	}

	popNode := q.front

	if q.front == q.rear {
		q.rear = nil
	}
	q.front = q.front.next

	return popNode.value
}
```
