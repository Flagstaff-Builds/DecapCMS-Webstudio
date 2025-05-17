# Content Management Guide

This guide explains how to manage content in your Decap CMS blog.

## Adding Blog Posts

1. Go to `https://YOUR-NETLIFY-SITE.netlify.app/admin/` (replace with your Netlify site URL)
2. Log in with your email (the one you were invited with)
3. Click "New Blog" to create a new blog post
4. Add your content including:
   - Title
   - Excerpt (optional)
   - Featured image (optional)
   - Content (using rich text or markdown)
   - Category (select from dropdown)
   - Tags (select multiple)
   - Author
5. Click "Publish" when you're ready to make the post live

## Managing Categories, Tags, and Authors

### Categories

1. In the admin panel, click on "Categories" in the left sidebar
2. Click "New Category" to create a new category
3. Add:
   - Name: The display name of the category
4. Click "Publish" to save the category

### Tags

1. In the admin panel, click on "Tags" in the left sidebar
2. Click "New Tag" to create a new tag
3. Add:
   - Name: The display name of the tag
4. Click "Publish" to save the tag

### Authors

1. In the admin panel, click on "Authors" in the left sidebar
2. Click "New Author" to create a new author
3. Add:
   - Name: The author's name
   - Avatar: An image URL for the author's profile picture (optional)
   - Bio: A short biography (optional)
4. Click "Publish" to save the author

## Working with Media

1. When adding images to your content, click the image button in the editor toolbar
2. You can either:
   - Upload a new image from your computer
   - Select a previously uploaded image
3. All uploaded images are stored in the `images/uploads` directory in your repository

## Markdown Features

When writing content, you can use all standard Markdown features:

### Text Formatting

* **Bold text** using `**double asterisks**`
* *Italic text* using `*single asterisks*`
* ~~Strikethrough~~ using `~~double tildes~~`

### Lists

Unordered list:
* Item 1
* Item 2
* Item 3

Ordered list:
1. First item
2. Second item
3. Third item

### Code

Inline code: `const example = "Hello World";`

Code block:
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```

### Images

You can include images like this:
```markdown
![Alt text](https://example.com/image.jpg)
```

### Links

Create links like this:
```markdown
[Link text](https://example.com)
```
