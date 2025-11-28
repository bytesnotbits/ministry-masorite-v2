# Backend Migration Tasks

## ✅ Completed: Read Operations Migration
- [x] Database Schema & Seeding
  - [x] Create `visits` migration
  - [x] Create `studies` migration
  - [x] Update `seed.js` to populate visits and studies
  - [x] Run migrations and seed database
- [x] Backend API Endpoints (Read)
  - [x] `GET /api/territories`
  - [x] `GET /api/people`
  - [x] `GET /api/visits`
  - [x] `GET /api/studies`
- [x] Frontend Refactoring (Read)
  - [x] Update `App.jsx` to fetch from API
  - [x] Refactor `HouseDetail.jsx` to use visits prop
  - [x] Refactor `BibleStudiesPage.jsx` to use props
  - [x] Refactor `PersonDetail.jsx` to use props
  - [x] Implement auto-refresh logic with `visitListKey` and `peopleListKey`

## 🔄 In Progress: Write Operations Migration

### Backend API Endpoints (Write)
- [ ] **Territories**
  - [ ] `POST /api/territories` - Create new territory
  - [ ] `PUT /api/territories/:id` - Update territory
  - [ ] `DELETE /api/territories/:id` - Delete territory (cascade)
- [ ] **Streets**
  - [ ] `POST /api/streets` - Create new street
  - [ ] `PUT /api/streets/:id` - Update street
  - [ ] `DELETE /api/streets/:id` - Delete street (cascade)
- [ ] **Houses**
  - [x] `PUT /api/houses/:id` - Update house (DONE)
  - [ ] `POST /api/houses` - Create new house
  - [ ] `DELETE /api/houses/:id` - Delete house
- [ ] **People**
  - [ ] `POST /api/people` - Create new person
  - [ ] `PUT /api/people/:id` - Update person
  - [ ] `DELETE /api/people/:id` - Delete person
- [ ] **Visits**
  - [ ] `POST /api/visits` - Create new visit
  - [ ] `PUT /api/visits/:id` - Update visit
  - [ ] `DELETE /api/visits/:id` - Delete visit
- [ ] **Studies**
  - [ ] `POST /api/studies` - Create new study
  - [ ] `PUT /api/studies/:id` - Update study
  - [ ] `DELETE /api/studies/:id` - Delete study

### Frontend Refactoring (Write)
- [ ] Update all `handleSave*` functions in `App.jsx` to call backend APIs
- [ ] Update all `handleDelete*` functions in `App.jsx` to call backend APIs
- [ ] Update all `handleUpdate*` functions in `App.jsx` to call backend APIs
- [ ] Ensure data refresh logic triggers after all write operations

## 🧹 Cleanup
- [ ] Remove IndexedDB code
  - [ ] Remove `database.js`
  - [ ] Remove `database-api.js`
  - [ ] Remove all `import` statements for IndexedDB functions
  - [ ] Remove IndexedDB initialization code
- [ ] Test complete migration
  - [ ] Verify all CRUD operations work
  - [ ] Verify data persists across reloads
  - [ ] Verify cascading deletes work correctly

## 📝 Notes

### Current State
- Backend server runs on `http://localhost:3001`
- Frontend reads all data from API
- **Writes still go to IndexedDB** (except house updates)
- Data is re-fetched from API after writes to show changes
- **Limitation**: New data added via IndexedDB will NOT persist after reload since the backend database is static

### Running the Application
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend && npm start
```

### Next Session Priority
Start with migrating write operations for **visits** and **people** since these are frequently used. Then move to territories/streets/houses, and finally studies.
