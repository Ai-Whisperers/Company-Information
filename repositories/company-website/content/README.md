# Content Management System

This directory contains all the content for the website organized in YAML files. The content is separated from the code to allow easy editing without touching the React components.

## Directory Structure

```
content/
├── README.md           # This file
├── pages/              # Page-level content
│   └── homepage.yml    # Homepage content
├── shared/             # Shared content blocks
│   ├── common.yml      # Common elements (contact info, company details, etc.)
│   ├── footer.yml      # Footer structure and content
│   ├── navigation.yml  # Navigation structure and links
│   └── page-template.yml # Base template structure for pages
├── team/               # Team member profiles
│   └── ivan-weiss-van-der-pol.yml
├── case-studies/       # Case study content
│   └── techcorp-cv-processing.yml
└── components/         # Component-level content (for reusable components)
```

## How It Works

1. **YAML Files**: All content (text, links, images, etc.) is stored in YAML files
2. **TypeScript Types**: Strong typing ensures content structure consistency
3. **Server-Side Loading**: Content is loaded at build time or on the server
4. **Dynamic Components**: React components render content dynamically
5. **Content References**: Pages can reference shared content blocks to reduce duplication

## Using Shared Content

### Reference Method

Include references to shared content in your page files:

```yaml
# In a page file
$use:
  navigation: true         # Use default navigation
  footer: true             # Use default footer
  common:
    contact: true          # Include common contact info
    team: false            # Don't include team info
```

### Extending Shared Content

You can extend or override shared content in your page files:

```yaml
# In a page file - extend navigation with page-specific items
navigation:
  $extend: true            # Extend default navigation
  items:
    - text: "Page-Specific Link"
      href: "/special-page"
  cta:
    text: "Custom CTA"     # Override the default CTA
```

## Page Content Structure

Each page YAML file should follow this structure:

```yaml
$use:                    # References to shared content
  navigation: true
  footer: true
  common:
    contact: true
    
meta:                   # SEO and page metadata
  title: "Page Title"
  description: "Page description for SEO"
  keywords: ["keyword1", "keyword2"]
  language: "es"

# ... page-specific content sections
```

## Content Types

### Buttons
```yaml
button:
  text: "Button Text"
  href: "https://example.com"
  variant: "default"    # default, outline, ghost, destructive
  size: "lg"           # default, sm, lg
  icon: "ArrowRight"   # Lucide icon name
```

### Icons
Icons use Lucide React icon names. Available icons: https://lucide.dev/icons/

Common icons:
- `Brain` - AI/intelligence
- `Zap` - Speed/energy
- `Shield` - Security/protection
- `Building2` - Company/organization
- `Globe` - Global/location
- `MessageSquare` - Communication
- `ArrowRight` - Navigation

### Images
```yaml
image:
  src: "/path/to/image.jpg"
  alt: "Image description"
  width: 800
  height: 600
```

### Links
```yaml
link:
  href: "https://example.com"
  text: "Link Text"
  external: true
  target: "_blank"
```

## Editing Content

### To change homepage content:
1. Edit `content/pages/homepage.yml`
2. The changes will be reflected automatically
3. No code changes required

### To add new sections:
1. Add the section to the YAML file
2. Update the TypeScript types in `src/types/content.ts`
3. Update the component rendering logic

### To add new pages:
1. Create a new YAML file in `content/pages/`
2. Create a new page component that uses `getPageContent()`
3. Add routing in Next.js

## Best Practices

### Content Writing
- Use clear, concise language
- Keep paragraphs short for web reading
- Include relevant keywords naturally
- Write compelling CTAs

### YAML Formatting
- Use 2 spaces for indentation
- Quote strings with special characters
- Use `|` for multi-line text blocks
- Use `>` for folded text blocks

### Shared Content Best Practices
- Move repetitive elements to shared files
- Only override when necessary
- Keep page-specific content focused on unique elements
- Use descriptive reference keys

### Maintenance
- Validate YAML syntax before committing
- Test content changes on staging
- Keep backup copies of important content
- Document any custom content types

## Multi-language Support

To add multiple languages:

1. Create language-specific YAML files:
   ```
   pages/
   ├── homepage.yml      # Default (Spanish)
   ├── homepage.en.yml   # English
   └── homepage.pt.yml   # Portuguese
   ```

2. Update the content loader to handle language codes

3. Use Next.js internationalization features

## Content Validation

The system includes TypeScript validation to ensure:
- Required fields are present
- Data types are correct
- Icon names are valid
- Links are properly formatted

If content validation fails, the site will show fallback content instead of crashing.

## Environment-Specific Content

For different environments (dev, staging, production):

1. Create environment-specific content files
2. Use environment variables to load different content
3. Override specific sections per environment

Example:
```yaml
# Override contact info for staging
contact:
  info:
    - type: "email"
      value: "staging@aiparaguay.com"
```