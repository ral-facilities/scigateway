# Changelog

## [v3.0.0](https://github.com/ral-facilities/scigateway/tree/v3.0.0) (2025-03-14)

## What's Changed

### Features
* Remove libgconf install step on CI jobs by @louise-davies in https://github.com/ral-facilities/scigateway/pull/1426
### Dependencies
* Bump nanoid from 3.3.4 to 3.3.8 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1425
* Update dependency ubuntu to v24 by @renovate in https://github.com/ral-facilities/scigateway/pull/1427
* Update dependency axios to v1.8.2 [SECURITY] by @renovate in https://github.com/ral-facilities/scigateway/pull/1429
* Bump @babel/runtime from 7.23.9 to 7.26.10 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1433
* Bump @babel/helpers from 7.20.1 to 7.26.10 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1432
* Update node to 20.18.3-alpine3.21 and httpd to 2.4.63-alpine3.21 in docker images by @joelvdavies in https://github.com/ral-facilities/scigateway/pull/1431
* Bump axios from 1.7.4 to 1.8.2 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1428
* Bump @babel/runtime-corejs3 from 7.20.1 to 7.26.10 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1430

**Full Changelog**: https://github.com/ral-facilities/scigateway/compare/v3.0.0...v3.0.1

## [v3.0.0](https://github.com/ral-facilities/scigateway/tree/v3.0.0) (2024-11-27)

## What's Changed

### Features

* add darkBlue colour to theming  by @joshuadkitenge in https://github.com/ral-facilities/scigateway/pull/1375
* Increase toast functionailty #355 by @joshuadkitenge in https://github.com/ral-facilities/scigateway/pull/1376
* Print improvement for IMS by @joelvdavies in https://github.com/ral-facilities/scigateway/pull/1385
* Change accessibility page variable to be more general #356 by @joshuadkitenge in https://github.com/ral-facilities/scigateway/pull/1377
* Fix error colour inconsistency for IMS by @joelvdavies in https://github.com/ral-facilities/scigateway/pull/1393
* Ims maintenance endpoints by @MatteoGuarnaccia5 in https://github.com/ral-facilities/scigateway/pull/1398
* Add docker image push when tags pushed #1390 by @joelvdavies in https://github.com/ral-facilities/scigateway/pull/1420
* Generate custom admin tabs from plugin routes #1418 by @joshuadkitenge in https://github.com/ral-facilities/scigateway/pull/1419
* React 18 #1205 by @louise-davies in https://github.com/ral-facilities/scigateway/pull/1275

### Dependencies

* Bump webpack from 5.76.1 to 5.94.0 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1408
* Update dependency axios to v1.7.4 [SECURITY] by @renovate in https://github.com/ral-facilities/scigateway/pull/1407
* Update Node.js to v20.17.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1411
* Update httpd:2.4.59-alpine3.20 Docker image to http:2.4.62-alpine3.20 by @renovate in https://github.com/ral-facilities/scigateway/pull/1410
* Update dependency express to v4.20.0 [SECURITY] by @renovate in https://github.com/ral-facilities/scigateway/pull/1414
* Bump rollup from 2.79.1 to 2.79.2 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1416
* Bump http-proxy-middleware from 2.0.6 to 2.0.7 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1417
* Bump cross-spawn from 7.0.3 to 7.0.6 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1421

## New Contributors

* @MatteoGuarnaccia5 made their first contribution in https://github.com/ral-facilities/scigateway/pull/1398

**Full Changelog**: https://github.com/ral-facilities/scigateway/compare/v2.0.0...v3.0.0

## [v2.0.0](https://github.com/ral-facilities/scigateway/tree/v2.0.0) (2024-07-24)

## What's Changed

### Features

* Create Actions workflow for uploading container image to Harbor by @VKTB in https://github.com/ral-facilities/scigateway/pull/1040
* Create Dockerfile by @VKTB in https://github.com/ral-facilities/scigateway/pull/1036
* Implement best practices in Docker image by @VKTB in https://github.com/ral-facilities/scigateway/pull/1077
* Improving and fixing accessibility statement by @sam-glendenning in https://github.com/ral-facilities/scigateway/pull/1064
* Update yarn.lock by @louise-davies in https://github.com/ral-facilities/scigateway/pull/1126
* Change top of page icon unicode by @kennethnym in https://github.com/ral-facilities/scigateway/pull/1119
* Configure Renovate by @renovate in https://github.com/ral-facilities/scigateway/pull/1125
* Limit height of page content so that app bar and nav bar stays visible when scrolling by @kennethnym in https://github.com/ral-facilities/scigateway/pull/1121
* Auto detect fragment in URL and jump to element by @kennethnym in https://github.com/ral-facilities/scigateway/pull/1118
* Updating yarn.lock to remove unnecessary package by @sam-glendenning in https://github.com/ral-facilities/scigateway/pull/1195
* changed footer to include SCD by @LunaBarrett in https://github.com/ral-facilities/scigateway/pull/1164
* Feature/upgrade cypress v10 #1194 by @jounaidr in https://github.com/ral-facilities/scigateway/pull/1216
* #122 - have CDN fallbacks for react & react-dom by @louise-davies in https://github.com/ral-facilities/scigateway/pull/1228
* Bump node version in CI from v14 to v16 by @kennethnym in https://github.com/ral-facilities/scigateway/pull/1264
* Refactor docker-build workflow into a job in ci-build workflow by @VKTB in https://github.com/ral-facilities/scigateway/pull/1106
* Optimised production build fails to compile by @VKTB in https://github.com/ral-facilities/scigateway/pull/1269
* Bring k8sdeployment branch up to date and fix Docker build by @VKTB in https://github.com/ral-facilities/scigateway/pull/1270
* Migrate scigateway tests to testing-library by @kennethnym in https://github.com/ral-facilities/scigateway/pull/1273
* Feature/use ga4 #1219 by @jounaidr in https://github.com/ral-facilities/scigateway/pull/1271
* Docker image improvements by @VKTB in https://github.com/ral-facilities/scigateway/pull/1274
* Improve scigateway mobile support by @kennethnym in https://github.com/ral-facilities/scigateway/pull/1281
* Add severity selection to admin scheduledMaintenance #1053 by @kaperoo in https://github.com/ral-facilities/scigateway/pull/1314
* Check for maintenance state every 5 minutes and force refresh if changed by @kaperoo in https://github.com/ral-facilities/scigateway/pull/1315
* Update Node version to 20 in CI by @louise-davies in https://github.com/ral-facilities/scigateway/pull/1318
* Feature/non authentication #1313 by @kaperoo in https://github.com/ral-facilities/scigateway/pull/1317
* Containerize application and configure GitHub Actions to build and push Docker image to Harbor by @VKTB in https://github.com/ral-facilities/scigateway/pull/1276
* Upgrade Node by @VKTB in https://github.com/ral-facilities/scigateway/pull/1327
* Pin docker base images to SHA by @VKTB in https://github.com/ral-facilities/scigateway/pull/1382
* Bump Docker base images by @VKTB in https://github.com/ral-facilities/scigateway/pull/1395
* Fix help page top of page links #1400 by @joelvdavies in https://github.com/ral-facilities/scigateway/pull/1401
* Update release workflow by @louise-davies in https://github.com/ral-facilities/scigateway/pull/1405

### Dependencies

* Organise dev and prod dependencies by @VKTB in https://github.com/ral-facilities/scigateway/pull/1026
* React 17 and MUIv5 upgrade #768 #927 by @joelvdavies in https://github.com/ral-facilities/scigateway/pull/930
* Pin dependencies by @renovate in https://github.com/ral-facilities/scigateway/pull/1130
* Update dependency axios to v0.27.2 by @renovate in https://github.com/ral-facilities/scigateway/pull/1132
* Update dependency cypress to v9.7.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1135
* Update dependency concurrently to v7.2.2 by @renovate in https://github.com/ral-facilities/scigateway/pull/1134
* Update dependency axios-mock-adapter to v1.21.1 by @renovate in https://github.com/ral-facilities/scigateway/pull/1133
* Update dependency @types/jest to v27.5.2 by @renovate in https://github.com/ral-facilities/scigateway/pull/1131
* Update dependency eslint to v8.19.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1136
* Update dependency eslint-config-prettier to v8.5.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1138
* Update dependency express to v4.18.1 by @renovate in https://github.com/ral-facilities/scigateway/pull/1140
* Update dependency eslint-plugin-prettier to v4.2.1 by @renovate in https://github.com/ral-facilities/scigateway/pull/1139
* Update dependency prettier to v2.7.1 by @renovate in https://github.com/ral-facilities/scigateway/pull/1144
* Update dependency lint-staged to v12.5.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1143
* Update dependency react-joyride to v2.5.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1146
* Update emotion monorepo to v11.9.3 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1149
* Update actions/cache action to v3 by @renovate in https://github.com/ral-facilities/scigateway/pull/1152
* Update actions/checkout action to v3 by @renovate in https://github.com/ral-facilities/scigateway/pull/1153
* Update actions/setup-node action to v3 by @renovate in https://github.com/ral-facilities/scigateway/pull/1154
* Update codecov/codecov-action action to v3 by @renovate in https://github.com/ral-facilities/scigateway/pull/1155
* Update dependency typescript to v4.7.4 by @renovate in https://github.com/ral-facilities/scigateway/pull/1148
* Update typescript-eslint monorepo to v5.30.6 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1151
* Update dependency cypress-failed-log to v2.10.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1137
* Update dependency redux to v4.2.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1147
* Update dependency husky to v8 by @renovate in https://github.com/ral-facilities/scigateway/pull/1161
* Update dependency lint-staged to v13 by @renovate in https://github.com/ral-facilities/scigateway/pull/1163
* Update dependency eslint to v8.20.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1159
* Update dependency serve to v14 by @renovate in https://github.com/ral-facilities/scigateway/pull/1167
* Update dependency concurrently to v7.3.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1162
* Update dependency i18next to v21.8.14 by @renovate in https://github.com/ral-facilities/scigateway/pull/1142
* Update dependency react-i18next to v11.18.3 by @renovate in https://github.com/ral-facilities/scigateway/pull/1145
* Update typescript-eslint monorepo to v5.31.0 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1170
* Add @testing-library dependencies by @kennethnym in https://github.com/ral-facilities/scigateway/pull/1171
* Update dependency @testing-library/user-event to v14.4.2 by @renovate in https://github.com/ral-facilities/scigateway/pull/1175
* Update typescript-eslint monorepo to v5.32.0 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1174
* Update emotion monorepo to v11.10.0 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1172
* Update dependency eslint to v8.21.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1173
* Lock file maintenance by @renovate in https://github.com/ral-facilities/scigateway/pull/1169
* Pin dependencies by @renovate in https://github.com/ral-facilities/scigateway/pull/1180
* Update dependency i18next to v21.9.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1176
* Update material-ui monorepo (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1150
* Update dependency eslint to v8.22.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1178
* Update dependency eslint to v8.23.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1183
* Update dependency @testing-library/react to v13.4.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1185
* Update dependency @mui/icons-material to v5.10.3 by @renovate in https://github.com/ral-facilities/scigateway/pull/1181
* Update dependency @types/jest to v29 by @renovate in https://github.com/ral-facilities/scigateway/pull/1184
* Downgrading @testing-library/react to v12.1.5 by @sam-glendenning in https://github.com/ral-facilities/scigateway/pull/1187
* Update dependency concurrently to v7.4.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1186
* Update typescript-eslint monorepo to v5.38.0 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1177
* Update dependency eslint to v8.24.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1189
* Update typescript-eslint monorepo to v5.39.0 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1197
* Lock file maintenance by @renovate in https://github.com/ral-facilities/scigateway/pull/1179
* Update dependency react-redux to v8 by @renovate in https://github.com/ral-facilities/scigateway/pull/1165
* Update dependency i18next to v21.10.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1199
* Update dependency eslint to v8.25.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1200
* Update dependency @types/jest to v29.1.2 by @renovate in https://github.com/ral-facilities/scigateway/pull/1196
* Update dependency @types/jest to v29.2.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1203
* Update typescript-eslint monorepo to v5.40.1 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1202
* Update dependency concurrently to v7.5.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1208
* Update dependency eslint to v8.26.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1207
* Update dependency i18next-browser-languagedetector to v7 by @renovate in https://github.com/ral-facilities/scigateway/pull/1211
* Update typescript-eslint monorepo to v5.41.0 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1209
* Update dependency react-i18next to v12 by @renovate in https://github.com/ral-facilities/scigateway/pull/1206
* Lock file maintenance by @renovate in https://github.com/ral-facilities/scigateway/pull/1201
* Update dependency i18next-http-backend to v2 by @renovate in https://github.com/ral-facilities/scigateway/pull/1213
* Update dependency typescript to v4.8.4 by @renovate in https://github.com/ral-facilities/scigateway/pull/1182
* Update dependency i18next to v22 by @renovate in https://github.com/ral-facilities/scigateway/pull/1204
* Update dependency @types/node to v18 by @renovate in https://github.com/ral-facilities/scigateway/pull/1210
* Update typescript-eslint monorepo to v5.42.0 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1214
* Update dependency serve to v14.1.1 by @renovate in https://github.com/ral-facilities/scigateway/pull/1220
* Update dependency eslint to v8.27.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1218
* Bump loader-utils from 2.0.3 to 2.0.4 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1223
* Update typescript-eslint monorepo to v5.43.0 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1224
* Update Yarn to v3.3.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1226
* Update dependency cypress to v11 by @renovate in https://github.com/ral-facilities/scigateway/pull/1221
* Update dependency eslint to v8.28.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1227
* Update dependency typescript to v4.9.3 by @renovate in https://github.com/ral-facilities/scigateway/pull/1225
* Update typescript-eslint monorepo to v5.44.0 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1230
* Lock file maintenance by @renovate in https://github.com/ral-facilities/scigateway/pull/1215
* Update dependency prettier to v2.8.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1232
* Update typescript-eslint monorepo to v5.45.0 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1233
* Update dependency eslint to v8.29.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1234
* Bump decode-uri-component from 0.2.0 to 0.2.2 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1235
* Update dependency cypress to v12.0.1 by @renovate in https://github.com/ral-facilities/scigateway/pull/1231
* Update dependency concurrently to v7.6.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1229
* Update dependency lint-staged to v13.1.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1236
* Update dependency start-server-and-test to v1.15.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1237
* Update typescript-eslint monorepo to v5.46.0 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1240
* Update dependency react-i18next to v12.1.1 by @renovate in https://github.com/ral-facilities/scigateway/pull/1238
* Update dependency i18next-http-backend to v2.1.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1241
* Update dependency cypress to v12.1.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1242
* Update dependency jsonwebtoken to v9 [SECURITY] by @renovate in https://github.com/ral-facilities/scigateway/pull/1249
* Update dependency wait-on to v7 by @renovate in https://github.com/ral-facilities/scigateway/pull/1245
* Bump json5 from 1.0.1 to 1.0.2 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1251
* Update dependency @types/jsonwebtoken to v9 by @renovate in https://github.com/ral-facilities/scigateway/pull/1252
* Update dependency cypress to v12.3.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1250
* Update typescript-eslint monorepo to v5.48.2 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1247
* Update dependency eslint to v8.32.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1246
* Update dependency eslint-config-prettier to v8.6.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1253
* Update typescript-eslint monorepo to v5.49.0 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1255
* Update dependency eslint to v8.33.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1259
* Update dependency @types/jest to v29.4.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1258
* Update dependency serve to v14.2.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1257
* Bump @sideway/formula from 3.0.0 to 3.0.1 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1263
* Bump webpack from 5.75.0 to 5.76.1 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1272
* Bump http-cache-semantics from 4.1.0 to 4.1.1 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1260
* Pin dependencies by @renovate in https://github.com/ral-facilities/scigateway/pull/1277
* Replace dependency babel-eslint with @babel/eslint-parser 7.11.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1278
* Update dependency cypress to v12.15.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1256
* Update typescript-eslint monorepo to v5.60.0 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1261
* Update dependency eslint to v8.43.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1267
* Update dependency @types/node to v18.16.18 by @renovate in https://github.com/ral-facilities/scigateway/pull/1266
* Update Yarn to v3.6.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1262
* Update dependency @babel/eslint-parser to v7.22.5 by @renovate in https://github.com/ral-facilities/scigateway/pull/1279
* Update actions/checkout digest to c85c95e by @renovate in https://github.com/ral-facilities/scigateway/pull/1282
* Update dependency @types/jest to v29.5.2 by @renovate in https://github.com/ral-facilities/scigateway/pull/1283
* Update dependency eslint-config-prettier to v8.8.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1284
* Update dependency lint-staged to v13.2.2 by @renovate in https://github.com/ral-facilities/scigateway/pull/1287
* Update dependency eslint-plugin-cypress to v2.13.3 by @renovate in https://github.com/ral-facilities/scigateway/pull/1285
* Update dependency i18next-http-backend to v2.2.1 by @renovate in https://github.com/ral-facilities/scigateway/pull/1286
* Update dependency react-i18next to v12.3.1 by @renovate in https://github.com/ral-facilities/scigateway/pull/1289
* Update emotion monorepo (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1291
* Update dependency cypress to v12.16.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1288
* Update dependency i18next-browser-languagedetector to v7.1.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1292
* Update dependency concurrently to v8 by @renovate in https://github.com/ral-facilities/scigateway/pull/1294
* Update dependency start-server-and-test to v2 by @renovate in https://github.com/ral-facilities/scigateway/pull/1297
* Update dependency typescript to v5 by @renovate in https://github.com/ral-facilities/scigateway/pull/1298
* Update dependency eslint to v8.44.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1299
* Update actions/setup-node digest to e33196f by @renovate in https://github.com/ral-facilities/scigateway/pull/1300
* Update typescript-eslint monorepo to v5.61.0 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1301
* Bump semver from 6.3.0 to 6.3.1 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1304
* Update dependency cypress to v12.17.1 by @renovate in https://github.com/ral-facilities/scigateway/pull/1303
* Update typescript-eslint monorepo to v5.62.0 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1305
* Bump word-wrap from 1.2.3 to 1.2.4 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1308
* Update dependency react-redux to v8.1.2 by @renovate in https://github.com/ral-facilities/scigateway/pull/1290
* Update dependency eslint to v8.47.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1307
* Bump @adobe/css-tools from 4.0.1 to 4.3.1 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1311
* Bump @babel/traverse from 7.20.1 to 7.23.2 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1316
* Update dependency axios to v1 [SECURITY] by @renovate in https://github.com/ral-facilities/scigateway/pull/1320
* Bump axios from 1.6.0 to 1.6.1 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1321
* Update richardsimko/update-tag digest to e173a8e by @renovate in https://github.com/ral-facilities/scigateway/pull/1322
* Update actions/checkout digest to f43a0e5 by @renovate in https://github.com/ral-facilities/scigateway/pull/1309
* Update actions/setup-node digest to 1a4442c by @renovate in https://github.com/ral-facilities/scigateway/pull/1310
* Bump @adobe/css-tools from 4.3.1 to 4.3.2 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1326
* Bump follow-redirects from 1.15.3 to 1.15.4 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1330
* Update Yarn to v3.7.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1324
* Update dependency i18next to v23 by @renovate in https://github.com/ral-facilities/scigateway/pull/1295
* Update dependency @babel/eslint-parser to v7.23.3 by @renovate in https://github.com/ral-facilities/scigateway/pull/1325
* Update dependency @testing-library/user-event to v14.5.2 by @renovate in https://github.com/ral-facilities/scigateway/pull/1329
* Update dependency @testing-library/jest-dom to v5.17.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1328
* Update dependency @types/node to v18.19.7 by @renovate in https://github.com/ral-facilities/scigateway/pull/1331
* Update dependency axios-mock-adapter to v1.22.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1332
* Update dependency eslint to v8.56.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1333
* Update dependency eslint-plugin-cypress to v2.15.1 by @renovate in https://github.com/ral-facilities/scigateway/pull/1335
* Update dependency eslint-config-prettier to v8.10.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1334
* Update dependency i18next-browser-languagedetector to v7.2.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1336
* Update dependency i18next-http-backend to v2.4.2 by @renovate in https://github.com/ral-facilities/scigateway/pull/1337
* Update dependency lint-staged to v13.3.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1338
* Update dependency react-joyride to v2.7.2 by @renovate in https://github.com/ral-facilities/scigateway/pull/1339
* Update dependency typescript to v5.3.3 by @renovate in https://github.com/ral-facilities/scigateway/pull/1340
* Update docker/build-push-action action to v4.2.1 by @renovate in https://github.com/ral-facilities/scigateway/pull/1342
* Update docker/login-action action to v2.2.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1343
* Update dependency wait-on to v7.2.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1341
* Update Node.js to v20.11.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1345
* Update docker/metadata-action action to v4.6.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1344
* Update actions/checkout action to v4 by @renovate in https://github.com/ral-facilities/scigateway/pull/1347
* Update actions/setup-node action to v4 by @renovate in https://github.com/ral-facilities/scigateway/pull/1348
* Update dependency lint-staged to v15 by @renovate in https://github.com/ral-facilities/scigateway/pull/1352
* Update dependency @testing-library/jest-dom to v6 by @renovate in https://github.com/ral-facilities/scigateway/pull/1349
* Update codecov/codecov-action digest to 4fe8c5f by @renovate in https://github.com/ral-facilities/scigateway/pull/1353
* Update dependency react-i18next to v14 by @renovate in https://github.com/ral-facilities/scigateway/pull/1354
* Update dependency @testing-library/jest-dom to v6.3.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1355
* Update dependency loglevel to v1.9.1 by @renovate in https://github.com/ral-facilities/scigateway/pull/1358
* Update dependency husky to v9 by @renovate in https://github.com/ral-facilities/scigateway/pull/1360
* Update codecov/codecov-action digest to ab904c4 by @renovate in https://github.com/ral-facilities/scigateway/pull/1359
* Update codecov/codecov-action action to v4 by @renovate in https://github.com/ral-facilities/scigateway/pull/1362
* Update dependency @testing-library/jest-dom to v6.4.1 by @renovate in https://github.com/ral-facilities/scigateway/pull/1363
* Update dependency i18next to v23.8.2 by @renovate in https://github.com/ral-facilities/scigateway/pull/1361
* Update Yarn to v3.8.0 by @renovate in https://github.com/ral-facilities/scigateway/pull/1364
* Update dependency cypress to v13 by @renovate in https://github.com/ral-facilities/scigateway/pull/1350
* Update Yarn to v4 by @renovate in https://github.com/ral-facilities/scigateway/pull/1346
* Update dependency prettier to v3 by @renovate in https://github.com/ral-facilities/scigateway/pull/1302
* Update material-ui monorepo to v5.15.10 (minor) by @renovate in https://github.com/ral-facilities/scigateway/pull/1244
* Update dependency eslint-config-prettier to v9 by @renovate in https://github.com/ral-facilities/scigateway/pull/1351
* Update dependency redux-thunk to v3 by @renovate in https://github.com/ral-facilities/scigateway/pull/1365
* Update typescript-eslint monorepo to v7 (major) by @renovate in https://github.com/ral-facilities/scigateway/pull/1374
* Update Node.js to 8765147 by @renovate in https://github.com/ral-facilities/scigateway/pull/1384
* Bump follow-redirects from 1.15.5 to 1.15.6 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1381
* Bump webpack-dev-middleware from 5.3.3 to 5.3.4 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1383
* Bump express from 4.18.1 to 4.19.2 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1386
* Bump braces from 3.0.2 to 3.0.3 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1396
* Bump ws from 7.5.9 to 7.5.10 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1397
* Bump ejs from 3.1.8 to 3.1.10 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1391
* Bump tar from 6.1.12 to 6.2.1 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1389
* Bump ip from 2.0.0 to 2.0.1 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1368
* Bump axios from 1.6.1 to 1.6.2 by @dependabot in https://github.com/ral-facilities/scigateway/pull/1402

## New Contributors

* @kennethnym made their first contribution in https://github.com/ral-facilities/scigateway/pull/1119
* @renovate made their first contribution in https://github.com/ral-facilities/scigateway/pull/1125
* @LunaBarrett made their first contribution in https://github.com/ral-facilities/scigateway/pull/1164
* @jounaidr made their first contribution in https://github.com/ral-facilities/scigateway/pull/1216
* @kaperoo made their first contribution in https://github.com/ral-facilities/scigateway/pull/1314

**Full Changelog**: https://github.com/ral-facilities/scigateway/compare/v1.1.0...v2.0.0

## [v1.1.0](https://github.com/ral-facilities/scigateway/tree/v1.1.0) (2022-06-21)

[Full Changelog](https://github.com/ral-facilities/scigateway/compare/v1.0.0...v1.1.0)

**Implemented enhancements:**

- \#1086 - enable custom logos to be larger than 24px [\#1090](https://github.com/ral-facilities/scigateway/pull/1090) ([louise-davies](https://github.com/louise-davies))
- Customisable primary colour [\#1087](https://github.com/ral-facilities/scigateway/pull/1087) ([louise-davies](https://github.com/louise-davies))
- Adding arrow on left of headers in help page \#1075 [\#1076](https://github.com/ral-facilities/scigateway/pull/1076) ([sam-glendenning](https://github.com/sam-glendenning))
- \#1061 - have menu open by default no matter if you're logged in or not [\#1065](https://github.com/ral-facilities/scigateway/pull/1065) ([louise-davies](https://github.com/louise-davies))
- Homepage accessible regardless of login status \#1049 [\#1050](https://github.com/ral-facilities/scigateway/pull/1050) ([sam-glendenning](https://github.com/sam-glendenning))

**Fixed bugs:**

- \#1081 - add autoLogin setting to control whether we attempt autoLogin [\#1084](https://github.com/ral-facilities/scigateway/pull/1084) ([louise-davies](https://github.com/louise-davies))
- Fix token refresh error [\#1072](https://github.com/ral-facilities/scigateway/pull/1072) ([louise-davies](https://github.com/louise-davies))
- Preventing app bar from opening nav drawer on failed login attempt \#999 [\#1044](https://github.com/ral-facilities/scigateway/pull/1044) ([sam-glendenning](https://github.com/sam-glendenning))

**Security fixes:**

- Bump async from 2.6.3 to 2.6.4 [\#1078](https://github.com/ral-facilities/scigateway/pull/1078) ([dependabot[bot]](https://github.com/apps/dependabot))

**Merged pull requests:**

- Merge main into develop [\#1096](https://github.com/ral-facilities/scigateway/pull/1096) ([louise-davies](https://github.com/louise-davies))
- Update cookie policy [\#1089](https://github.com/ral-facilities/scigateway/pull/1089) ([louise-davies](https://github.com/louise-davies))
- Bump ejs from 3.1.6 to 3.1.7 [\#1055](https://github.com/ral-facilities/scigateway/pull/1055) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump minimist from 1.2.5 to 1.2.6 [\#1015](https://github.com/ral-facilities/scigateway/pull/1015) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump node-forge from 1.2.1 to 1.3.0 [\#1004](https://github.com/ral-facilities/scigateway/pull/1004) ([dependabot[bot]](https://github.com/apps/dependabot))
- Bump i18next-http-backend from 1.3.1 to 1.4.0 [\#988](https://github.com/ral-facilities/scigateway/pull/988) ([dependabot[bot]](https://github.com/apps/dependabot))



## [v1.0.0](https://github.com/ral-facilities/scigateway/tree/v1.0.0) (2022-03-31)

Initial release for ISIS


\* *This Changelog was automatically generated by [github_changelog_generator](https://github.com/github-changelog-generator/github-changelog-generator)*
