<img alt="logo" style="float: center;right: 0px" src="https://github.com/user-attachments/assets/fe240bc6-5149-4350-bf5c-5a51ea0bd7e4" width="100" div align=right>
<p></p>

**[Comment Hide]**

The plugin allows you to hide and show comments, and saves them to a specified folder.

#### Why use?

Windows/Linux HotKey `Ctrl+Shift+P` macOS HotKey `Cmd+Shift+P`

1. Save Comments: Create `.annotations/` storage code comments and **Delete the current file comment** move comments to `.annotations`.
2. Restore Comments: Restore comments from `.annotations/` to the current file.

#### Public comments

> [!WARNING]
> After executing `Save Comments`, **please do not make any changes**, as this will disrupt the line numbers and prevent `Restore Comments` from restoring the comments.

```
/* !!!
  This will not be hidden and will be visible to everyone
*/

const x = 42; // This is a comment
/* This is a multi-line
   comment */
// Another comment
```

run `Save Comments`:

```js
/* !!!
  This will not be hidden and will be visible to everyone
*/

const x = 42;


```

#### Next?

[  ]: Restore all comments

[  ]: Hide all file comments to the `.annotations/` directory

[  ]: Customize hiding and showing, for example, comment blocks containing `>>>` will not be hidden, while those containing `<<<` will be hidden.

#### Support language

```js
javascript - html - markdown - css - c++ - c# - java - python - golang - rust - ruby - jsx/tsx
---
maybe more?
```

#### Support comments style

```js
// Hello

# Hello

/*
  Hello
*/

<!-- Hello -->

---

Why no support ''' ?
I am lazy

example:

{
  // image
}
{
  /* {isValidImageIcon
      ? <img src={imageUrl} className="w-full h-full rounded-full" alt="answer icon" />
      : (icon && icon !== '') ? <em-emoji id={icon} /> : <em-emoji id='🤖' />
    } */
}

run `save comments`:

{

}
{

}

```
