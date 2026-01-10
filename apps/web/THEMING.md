# Web Package Theming Strategy

## Dual Theming: Tailwind + Tamagui

This package intentionally uses **BOTH** Tailwind CSS and Tamagui:

### Tailwind CSS

- **Used in**: Public routes (/, /auth/\*, /about, /faq, /premium, /campaigns, /affiliate)
- **Reason**: Marketing content with custom designs, rapid prototyping, already established
- **Size**: ~8KB gzipped after purging unused classes
- **Configuration**: `tailwind.config.ts` with Tailwind v4

### Tamagui

- **Used in**: Dashboard routes (/dashboard/\*)
- **Reason**: UI consistency with mobile app, component reusability
- **Size**: ~15KB gzipped for components used
- **Components**: Button, Card, Input, Switch, MainLayout, SidebarItem, Navigation, Footer

### Why Both?

- **Total CSS**: ~23KB (acceptable for Cloudflare Workers)
- **Migration cost**: 40+ hours to convert 20+ route files to Tamagui
- **No conflicts**: Different class prefixes (`tw-` vs Tamagui styled components), isolated styling
- **Best of both worlds**: Tailwind for marketing flexibility, Tamagui for app consistency

### Conflict Prevention

- Tailwind uses utility classes with specific prefixes
- Tamagui components have isolated styling through `styled()` API
- No CSS specificity conflicts due to different approaches
- Vite configuration optimizes both frameworks independently

### Guidelines for New Code

- **New public pages**: Use Tailwind (marketing content, landing pages)
- **New dashboard features**: Use Tamagui (app consistency with mobile)
- **Shared components** (Navigation, Footer): Already using Tamagui - continue this pattern
- **Forms in dashboard**: Use Tamagui Input, Button, Switch components
- **Landing page sections**: Use Tailwind utility classes

### Bundle Size Impact

Current configuration:

- Tailwind CSS (purged): ~8KB gzipped
- Tamagui components: ~15KB gzipped
- **Total CSS**: ~23KB gzipped
- **JavaScript overhead**: Minimal (components tree-shaken)

Alternative approaches considered:

1. **Tamagui-only**: Would require rewriting 20+ files (~40 hours), no significant bundle savings
2. **Tailwind-only**: Would lose UI consistency with mobile app, require custom components

**Conclusion**: Current dual approach is optimal for this project.

### Technical Details

**Vite Configuration** (`vite.config.ts`):

```typescript
define: {
  "process.env.TAMAGUI_TARGET": JSON.stringify("web"),
},
ssr: {
  noExternal: ["tamagui", "@tamagui/*", "@syncstuff/ui"],
},
optimizeDeps: {
  include: ["tamagui", "@tamagui/core", "@tamagui/config"],
},
```

**Tailwind Configuration**:

- Tailwind v4 with Vite plugin
- Automatic purging of unused classes
- Optimized for Cloudflare Workers deployment

### Maintenance

- Keep both frameworks up to date
- Monitor bundle size after dependency updates
- Prefer Tamagui for new dashboard components
- Prefer Tailwind for new marketing pages
- Document any new patterns in this file

### Migration Path (Future)

If full consolidation is desired:

1. **Phase 1**: Migrate public routes to Tamagui (estimate: 40+ hours)
2. **Phase 2**: Remove Tailwind dependencies
3. **Phase 3**: Verify bundle size reduction (expected: ~8KB savings)

**Current recommendation**: Keep dual theming - migration cost exceeds benefits.
