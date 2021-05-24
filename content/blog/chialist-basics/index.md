---
title: "Chialisp Basics" 
date: "2021-05-24T04:43:45.796Z"
description: "Basic commands, operators, and example Chialisp program based on official YouTube 
video and docs"

---

Based on this video: [An Introduction to developing in Chialisp](https://www.youtube.com/watch?v=dEFLJSU87K8)

## Setup

Follow steps here: https://github.com/Chia-Network/clvm_tools

## Commands


```shell
brun '(q 100)'
(100)

brun '(+ (q . 2) (q . 3))'
5

run '(+ 2 3)'
5

brun '(* (q . 3) (q . 4) (q . 5))'
60

brun '(i (q . 1) (q . "true") (q . "false"))'
"true"

brun '(i (q . 0) (q . "true") (q . "false"))'
"false"

brun '(i (q . ()) (q . "true") (q . "false"))'
"false"

brun '(sha256 (q . "asdf"))'
0xf0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b

brun '(x)'
FAIL: clvm raise ()

brun '1' '(1 2 3 "a")'
(q 2 3 97)

brun '2' '(1 2 3 "a")'
1

brun '(f 1)' '(1 2 3 "a")'
1

brun '(i (= (f 1) (q . 100)) (q . "true") (q . "false"))' '(100)'
"true"

brun '(i (= (f 1) (q . 100)) (q . "true") (q . "false"))' '(200)'
"false"
```

```lisp
; demo.clvm
(mod (password puzzhash amount)
    (if (= (sha256 password) (q . 0x2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824))
        (list (list 51 puzzhash amount))
        (x "wrong password")
    )
)
```

```shell
run demo.clvm
(a (i (= (sha256 2) (q . 0x2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824)) (q 4 (c (q . 51) (c 5 (c 11 ()))) ()) (q 8 (q . "wrong password"))) 1)
```

```shell
brun '(a (i (= (sha256 2) (q . 0x2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824)) (q 4 (c (q . 51) (c 5 (c 11 ()))) ()) (q 8 (q . "wrong password"))) 1)' '("helloops" 0xcafef00d 200)'
FAIL: clvm raise ("wrong password")
```

```shell
brun '(a (i (= (sha256 2) (q . 0x2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824)) (q 4 (c (q . 51) (c 5 (c 11 ()))) ()) (q 8 (q . "wrong password"))) 1)' '("hello" 0xcafef00d 200)'
((51 0xcafef00d 200))
```