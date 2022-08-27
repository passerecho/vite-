var __defProp = Object.defineProperty;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {enumerable: true, configurable: true, writable: true, value}) : obj[key] = value;
var __assign = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// src/index.ts
import path2 from "path";

// src/utils.ts
import fs from "fs";
var toString = Object.prototype.toString;
function is(val, type) {
  return toString.call(val) === `[object ${type}]`;
}
function isFunction(val) {
  return is(val, "Function") || is(val, "AsyncFunction");
}
function isArray(val) {
  return val && Array.isArray(val);
}
function isRegExp(val) {
  return is(val, "RegExp");
}
function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("");
    }, time);
  });
}
function fileExists(f) {
  try {
    fs.accessSync(f, fs.constants.W_OK);
    return true;
  } catch (error) {
    return false;
  }
}

// src/index.ts
import {normalizePath} from "vite";

// src/createMockServer.ts
import path from "path";
import fs2 from "fs";
import chokidar from "chokidar";
import chalk from "chalk";
import url from "url";
import fg from "fast-glob";
import Mock from "mockjs";
import {build} from "esbuild";
import {pathToRegexp, match} from "path-to-regexp";
import module from "module";
var mockData = [];
async function createMockServer(opt = {mockPath: "mock", configPath: "vite.mock.config"}) {
  opt = __assign({
    mockPath: "mock",
    watchFiles: true,
    supportTs: true,
    configPath: "vite.mock.config.ts",
    logger: true
  }, opt);
  if (mockData.length > 0)
    return;
  mockData = await getMockConfig(opt);
  await createWatch(opt);
}
async function requestMiddleware(opt) {
  const {logger = true} = opt;
  const middleware = async (req, res, next) => {
    let queryParams = {};
    if (req.url) {
      queryParams = url.parse(req.url, true);
    }
    const reqUrl = queryParams.pathname;
    const matchRequest = mockData.find((item) => {
      if (!reqUrl || !item || !item.url) {
        return false;
      }
      if (item.method && item.method.toUpperCase() !== req.method) {
        return false;
      }
      return pathToRegexp(item.url).test(reqUrl);
    });
    if (matchRequest) {
      const isGet = req.method && req.method.toUpperCase() === "GET";
      const {response, rawResponse, timeout, statusCode, url: url2} = matchRequest;
      if (timeout) {
        await sleep(timeout);
      }
      const urlMatch = match(url2, {decode: decodeURIComponent});
      let query = queryParams.query;
      if (reqUrl) {
        if (isGet && JSON.stringify(query) === "{}" || !isGet) {
          const params = urlMatch(reqUrl).params;
          if (JSON.stringify(params) !== "{}") {
            query = urlMatch(reqUrl).params || {};
          } else {
            query = queryParams.query || {};
          }
        }
      }
      const self = {req, res, parseJson: parseJson.bind(null, req)};
      if (isFunction(rawResponse)) {
        await rawResponse.bind(self)(req, res);
      } else {
        const body = await parseJson(req);
        res.setHeader("Content-Type", "application/json");
        res.statusCode = statusCode || 200;
        const mockResponse = isFunction(response) ? response.bind(self)({url: req.url, body, query, headers: req.headers}) : response;
        res.end(JSON.stringify(Mock.mock(mockResponse)));
      }
      logger && loggerOutput("request invoke", req.url);
      return;
    }
    next();
  };
  return middleware;
}
function createWatch(opt) {
  const {configPath, logger, watchFiles} = opt;
  if (!watchFiles) {
    return;
  }
  const {absConfigPath, absMockPath} = getPath(opt);
  if (process.env.VITE_DISABLED_WATCH_MOCK === "true") {
    return;
  }
  const watchDir = [];
  const exitsConfigPath = fs2.existsSync(absConfigPath);
  exitsConfigPath && configPath ? watchDir.push(absConfigPath) : watchDir.push(absMockPath);
  const watcher = chokidar.watch(watchDir, {
    ignoreInitial: true
  });
  watcher.on("all", async (event, file) => {
    logger && loggerOutput(`mock file ${event}`, file);
    mockData = await getMockConfig(opt);
  });
}
function cleanRequireCache(opt) {
  if (!require.cache) {
    return;
  }
  const {absConfigPath, absMockPath} = getPath(opt);
  Object.keys(require.cache).forEach((file) => {
    if (file === absConfigPath || file.indexOf(absMockPath) > -1) {
      delete require.cache[file];
    }
  });
}
function parseJson(req) {
  return new Promise((resolve) => {
    let body = "";
    let jsonStr = "";
    req.on("data", function(chunk) {
      body += chunk;
    });
    req.on("end", function() {
      try {
        jsonStr = JSON.parse(body);
      } catch (err) {
        jsonStr = "";
      }
      resolve(jsonStr);
      return;
    });
  });
}
async function getMockConfig(opt) {
  cleanRequireCache(opt);
  const {absConfigPath, absMockPath} = getPath(opt);
  const {ignore, configPath, logger} = opt;
  let ret = [];
  if (configPath && fs2.existsSync(absConfigPath)) {
    logger && loggerOutput(`load mock data from`, absConfigPath);
    ret = await resolveModule(absConfigPath);
    return ret;
  }
  const mockFiles = fg.sync(`**/*.{ts,js}`, {
    cwd: absMockPath
  }).filter((item) => {
    if (!ignore) {
      return true;
    }
    if (isFunction(ignore)) {
      return ignore(item);
    }
    if (isRegExp(ignore)) {
      return !ignore.test(path.basename(item));
    }
    return true;
  });
  try {
    ret = [];
    const resolveModulePromiseList = [];
    for (let index = 0; index < mockFiles.length; index++) {
      const mockFile = mockFiles[index];
      resolveModulePromiseList.push(resolveModule(path.join(absMockPath, mockFile)));
    }
    const loadAllResult = await Promise.all(resolveModulePromiseList);
    for (const resultModule of loadAllResult) {
      let mod = resultModule;
      if (!isArray(mod)) {
        mod = [mod];
      }
      ret = [...ret, ...mod];
    }
  } catch (error) {
    loggerOutput(`mock reload error`, error);
    ret = [];
  }
  return ret;
}
async function resolveModule(p) {
  const result = await build({
    entryPoints: [p],
    outfile: "out.js",
    write: false,
    platform: "node",
    bundle: true,
    format: "cjs",
    metafile: true,
    target: "es2015"
  });
  const {text} = result.outputFiles[0];
  return await loadConfigFromBundledFile(p, text);
}
function getPath(opt) {
  const {mockPath, configPath} = opt;
  const cwd = process.cwd();
  const absMockPath = path.join(cwd, mockPath || "");
  const absConfigPath = path.join(cwd, configPath || "");
  return {
    absMockPath,
    absConfigPath
  };
}
function loggerOutput(title, msg, type = "info") {
  const tag = type === "info" ? chalk.cyan.bold(`[vite:mock]`) : chalk.red.bold(`[vite:mock-server]`);
  return console.log(`${chalk.dim(new Date().toLocaleTimeString())} ${tag} ${chalk.green(title)} ${chalk.dim(msg)}`);
}
async function loadConfigFromBundledFile(fileName, bundledCode) {
  const extension = path.extname(fileName);
  const extensions = module.Module._extensions;
  let defaultLoader;
  const isJs = extension === ".js";
  if (isJs) {
    defaultLoader = extensions[extension];
  }
  extensions[extension] = (module2, filename) => {
    if (filename === fileName) {
      ;
      module2._compile(bundledCode, filename);
    } else {
      if (!isJs) {
        extensions[extension](module2, filename);
      } else {
        defaultLoader(module2, filename);
      }
    }
  };
  let config;
  try {
    if (isJs && require && require.cache) {
      delete require.cache[fileName];
    }
    const raw = require(fileName);
    config = raw.__esModule ? raw.default : raw;
    if (defaultLoader && isJs) {
      extensions[extension] = defaultLoader;
    }
  } catch (error) {
    console.error(error);
  }
  return config;
}

// src/index.ts
(async () => {
  try {
    await import("mockjs");
  } catch (e) {
    throw new Error("vite-plugin-vue-mock requires mockjs to be present in the dependency tree.");
  }
})();
function getDefaultPath(supportTs = true) {
  return path2.resolve(process.cwd(), `src/main.${supportTs ? "ts" : "js"}`);
}
function viteMockServe(opt = {}) {
  let defaultPath = getDefaultPath();
  if (!fileExists(defaultPath)) {
    defaultPath = getDefaultPath(false);
    if (!fileExists(defaultPath)) {
      defaultPath = "";
    }
  }
  const defaultEnter = normalizePath(defaultPath);
  const {injectFile = defaultEnter} = opt;
  let isDev = false;
  let config;
  let needSourcemap = false;
  return {
    name: "vite:mock",
    enforce: "pre",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
      isDev = config.command === "serve";
      needSourcemap = !!resolvedConfig.build.sourcemap;
      isDev && createMockServer(opt);
    },
    configureServer: async ({middlewares}) => {
      const {localEnabled = isDev} = opt;
      if (!localEnabled) {
        return;
      }
      const middleware = await requestMiddleware(opt);
      middlewares.use(middleware);
    },
    async transform(code, id) {
      if (isDev || !injectFile || !id.endsWith(injectFile)) {
        return null;
      }
      const {prodEnabled = true, injectCode = ""} = opt;
      if (!prodEnabled) {
        return null;
      }
      return {
        map: needSourcemap ? this.getCombinedSourcemap() : null,
        code: `${code}
${injectCode}`
      };
    }
  };
}
export {
  viteMockServe
};
