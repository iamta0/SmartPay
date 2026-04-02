# SmartPay Fix & Polish TODO

✅ **Completed**: 
- Analysis complete, plan approved
- **Step 1**: All remaining files verified ✅ Complete/polished (transactionService pagination, Send flow, PIN keypad, Profile menu, TX item). No bugs/stubs.
- dataconnect unused (0 imports)

## Step 2: Clean Bloat ✅
- Deleted src/dataconnect-generated/ (unused bloat)


## Step 3: Config Fixes ✅
- ✅ Edit app.json: Removed dummy Firebase extra
- ✅ Created .env.example with current config
- ✅ Edit src/config/firebase.ts: Use EXPO_PUBLIC_ with hardcoded fallback

## Step 4: Polish & Test Data [Current]
- [ ] Add ErrorBoundary to App.tsx (global crashes)
- [ ] Update SETUP.md with test users/balance setup (add section)

## Step 5: Final Test
- [ ] Run `npx expo start --clear`
- [ ] Test full flow once DB setup
- [ ] attempt_completion
