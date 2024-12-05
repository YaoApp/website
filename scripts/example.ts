import { Exception, FS, SuiRequest } from "@yao/runtime";

const allowedExtensions = ["yao", "html", "css", "js", "ts", "json", "config"];

function GetSource(request: SuiRequest): Source[] {
  const id = request.params?.id || null;
  if (!id) {
    throw new Exception("ID is required", 400);
  }

  const path = `/templates/default/examples/${id}`;
  return getSource(path);
}

function getSource(path: string, withContent: boolean = true): Source[] {
  const fs = new FS("system");
  const pkgfile = `${path}/pkg.json`;
  if (fs.Exists(pkgfile)) {
    return getSourceFromPackage(pkgfile);
  }

  const files = fs.ReadDir(path);
  const contents: Record<string, string | null> = {};
  const paths: Record<string, string> = {};
  files.forEach((file: string) => {
    const ext = fs.ExtName(file);
    if (!allowedExtensions.includes(ext)) {
      return;
    }
    contents[ext] = withContent ? fs.ReadFile(file) : null;
    paths[ext] = file;
  });
  const sources: Source[] = [
    { name: "HTML", code: contents.html, lang: "html", path: paths.html },
    { name: "Yao DSL", code: contents.yao, lang: "json", path: paths.yao },
    { name: "CSS", code: contents.css, lang: "css", path: paths.css },
    { name: "JavaScript", code: contents.js, lang: "js", path: paths.js },
    { name: "TypeScript", code: contents.ts, lang: "ts", path: paths.ts },
    { name: "Data", code: contents.json, lang: "json", path: paths.json },
    { name: "Config", code: contents.config, lang: "json", path: paths.config },
  ];

  return sources.filter((source) => source.code !== undefined);
}

function getSourceFromPackage(
  pkgfile: string,
  withContent: boolean = true
): Source[] {
  const root = new FS("app");
  const data = new FS("data");
  const raw = data.ReadFile(pkgfile);
  const sources: Source[] = [];
  const pwd = data.DirName(pkgfile);
  try {
    const pkg: Package = JSON.parse(raw);
    const files = pkg.files || [];
    files.forEach((file) => {
      const ext = data.ExtName(file.path);
      if (!allowedExtensions.includes(ext)) {
        return;
      }

      let path = file.path;
      if (path.startsWith("./")) {
        path = `${pwd}/${path.substring(2)}`;
      } else if (!path.startsWith("/")) {
        path = `${pwd}/${path}`;
      }

      const exists = file.root ? root.Exists(path) : data.Exists(path);
      if (!exists) {
        sources.push({
          name: file.name,
          code: `// ${file.name} file not found`,
          lang: "ts",
        });
        return;
      }

      const lang = ext == "yao" ? "json" : ext;
      let code = null;
      if (withContent) {
        code = file.root ? root.ReadFile(path) : data.ReadFile(path);
      }

      sources.push({
        name: file.name,
        code: code,
        lang: lang,
        path: path,
        root: file.root,
      });
    });
  } catch (e) {}

  return sources;
}

function Download(id: string) {
  if (!id || id === "undefined") {
    throw new Exception("ID is required", 400);
  }

  let file = getZipFile(id);
  const name = id.replace("/", "-");
  const fs = new FS("system");
  if (fs.Exists(file)) {
    return { file: file, name: name, disposition: Disposition(name) };
  }

  // create zip file
  const path = `/templates/default/examples/${id}`;
  const sources = getSource(path, false);
  const zipfiles: File[] = [];
  sources.forEach((source) => {
    if (!source.path) return;
    const ext = fs.ExtName(source.path);
    if (!allowedExtensions.includes(ext)) {
      return;
    }
    zipfiles.push({
      name: source.path,
      path: source.path,
      ext: ext,
      root: source.root,
    });
  });

  file = zip(id, zipfiles);
  return { file: file, name: name, disposition: Disposition(name) };
}

function Disposition(name: string) {
  return `attachment; filename="${name}.zip"`;
}

function getZipFile(id: string) {
  const root = "/data/archive/examples";
  const dir = `${root}`;
  return `${dir}/${id}.zip`;
}

function zip(id: string, files: File[]) {
  const rootfs = new FS("app");
  const root = "/data/archive/examples";
  const dir = `${root}`;
  const tmpdir = `${dir}/${id}`;
  if (!rootfs.Exists(dir)) {
    rootfs.MkdirAll(dir);
  }

  files.forEach((file) => {
    const path = file.root ? file.path : `/data${file.path}`;
    rootfs.Copy(path, `${tmpdir}/${path}`);
  });

  const zipfile = `${dir}/${id}.zip`;
  if (rootfs.Exists(zipfile)) {
    rootfs.Remove(zipfile);
  }

  rootfs.Zip(tmpdir, zipfile);
  rootfs.RemoveAll(tmpdir);
  return zipfile.replace(/^\/data/, "");
}

type Source = {
  name: string;
  lang: string;
  path?: string | null;
  code?: string | null;
  root?: boolean;
};

type File = {
  name: string;
  path: string;
  ext: string;
  root?: boolean;
};

type Package = {
  name?: string;
  title?: string;
  description?: string;
  files: { name: string; path: string; root?: boolean }[];
};
