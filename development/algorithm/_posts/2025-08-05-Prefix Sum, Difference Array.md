---
title: "누적합(Prefix Sum), 차분 배열(Difference Array)"
categories:
  - development
  - algorithm
tags:
  - Golang
  - algorithm
last_modified_at: 2025-08-05
toc: true
---

## 누적합

Prefix Sum

수열 An에 대해서 각 Index까지의 구간의 합을 구하는 것

|index|1|2|3|4|5|
|-|-|-|-|-|-|
|value|1|3|5|7|9|
|prefix sum|1|4|9|16|25|

위 수열에서 `index = 5`의 prefix sum 값은 index가 1~5인 value들의 합을 말한다

## 차분 배열

Difference Array

수열 An에 대해서 이전 값 대비 변화량을 저장한 배열

|index|1|2|3|4|5|
|-|-|-|-|-|-|
|value|1|3|5|7|9|
|difference array|1|2|2|2|2|

D[0]은 A[0]을 그대로 가져온다

그 이후 부터 이전 인덱스의 값에서 변한 값을 저장한다

Difference Array에 대해 누적합을 구하면 원본 수열 An이 만들어진다

## 문제

### HackerRank Array Manipulation

![HackerRank Array Manipulation]({{ site.url }}/assets/images/dev/algorithm/prefix_sum_01.png)

![HackerRank Array Manipulation]({{ site.url }}/assets/images/dev/algorithm/prefix_sum_02.png)

```go
func arrayManipulation(n int32, queries [][]int32) int64 {
    arr := make([]int64, n)
    
    for _, q := range queries {
        start, end, value := q[0]-1, q[1], int64(q[2])
        
        arr[start] += value
        
        if end < n {
            arr[end] -= value
        }
    }
    
    maxNum, currNum := int64(0), int64(0)
    for _, v := range arr {
        currNum += v
        maxNum = max(maxNum, currNum)                
    }

    return maxNum
}
```

모든 결과를 array에 저장해서 최대값을 찾으면 overflow가 발생

차분 배열을 통해 여러 항목에 대한 연산을 낮은 시간 복잡도로 해결
