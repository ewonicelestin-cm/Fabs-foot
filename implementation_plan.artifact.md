# Refactoring Plan for FABS FOOT IA

Refactor the monolithic `App.tsx` into a modular structure to improve maintainability, performance, and UI.

## User Review Required

> [!IMPORTANT]
> The refactoring will change the file structure. `App.tsx` will be broken down into smaller components and services.

## Proposed Changes

### [Component Name]

#### [NEW] [types.ts](file:///C:/Users/pc/Downloads/fabs-foot-react-vite/fabs-foot/src/types/index.ts)
Define all shared types and interfaces.

#### [NEW] [api.ts](file:///C:/Users/pc/Downloads/fabs-foot-react-vite/fabs-foot/src/services/api.ts)
Extract API calls and data processing logic (fetching matches, stats, predictions).

#### [NEW] [MatchCard.tsx](file:///C:/Users/pc/Downloads/fabs-foot-react-vite/fabs-foot/src/components/MatchCard.tsx)
Extracted component for individual match cards.

#### [NEW] [MatchModal.tsx](file:///C:/Users/pc/Downloads/fabs-foot-react-vite/fabs-foot/src/components/MatchModal.tsx)
Extracted component for the detailed match analysis modal.

#### [MODIFY] [App.tsx](file:///C:/Users/pc/Downloads/fabs-foot-react-vite/fabs-foot/src/App.tsx)
Clean up the main App component to manage state and layout, delegating logic to services and components.

#### [MODIFY] [styles.css](file:///C:/Users/pc/Downloads/fabs-foot-react-vite/fabs-foot/src/styles.css)
Update styles if necessary to support the new component structure and potentially add some refinements.

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure no compilation errors.

### Manual Verification
- Verify the app still loads today's matches.
- Verify the featured match (PSG vs Aston Villa) still appears as a fallback.
- Verify the modal opens correctly with detailed stats.
- Verify the "Refresh" button works as expected.
