/* eslint-disable no-console */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./API.d.ts" />

function buildAll() {
    console.log("Building all projects...");
    os.cmd(`npm run build`); // 编译所有项目
    colorLog("green", "Build finished!");
}

function generatorManifests(name, entry, path) {
    const manifest = {
        entry: entry,
        name: name,
        type: "lse-quickjs",
        dependencies: [
            {
                name: "legacy-script-engine-quickjs",
            },
        ],
    };
    os.writeTo(`${path}/manifest.json`, JSON.stringify(manifest, null, 4));
    colorLog("pink", "Generated manifest.json for " + name);
}

function generatorFakeEntry(genPath, targetFile) {
    const data = `import * as _114514_ from "${targetFile}";`;
    os.writeTo(`${genPath}/entry.js`, data);
}

function copyAll() {
    console.log("Copying all projects and files...");

    const rootDir = os.path;
    const projectsDir = `${rootDir}/projects`;
    const binDir = `${rootDir}/bin`;

    os.mkdir(binDir);

    // copy FakePlayer
    {
        console.log("Copying FakePlayer...");
        const fakePlayerDir = `${projectsDir}/FakePlayer`;
        const fakePlayerBinDir = `${binDir}/FakePlayer`;
        os.mkdir(fakePlayerBinDir);
        os.mkdir(`${fakePlayerBinDir}/FakePlayer`);

        os.copy(`${fakePlayerDir}/dist/`, `${fakePlayerBinDir}/FakePlayer/dist`);
        os.copy(`${rootDir}/LICENSE`, fakePlayerBinDir);
        if (os.exists(`${fakePlayerDir}/README.md`)) {
            os.copy(`${fakePlayerDir}/README.md`, fakePlayerBinDir);
        } else console.warn("No README.md found in FakePlayer");
        colorLog("green", "Copied FakePlayer");

        generatorFakeEntry(`${fakePlayerBinDir}/FakePlayer`, "./plugins/FakePlayer/dist/index.js");
        generatorManifests("FakePlayer", "entry.js", `${fakePlayerBinDir}/FakePlayer`);
    }

    // copy UMenu、UMenuEdit、UMenuExtension
    {
        console.log("Copying UMenu...");
        const uMenuDir = `${projectsDir}/UMenu`;
        const uMenuBinDir = `${binDir}`;

        os.mkdir(`${uMenuBinDir}/UMenu`);
        os.mkdir(`${uMenuBinDir}/UMenu/UMenu`);
        os.copy(`${uMenuDir}/dist/UMenu.js`, `${uMenuBinDir}/UMenu/UMenu/UMenu.js`); // 插件本体
        os.copy(`${uMenuDir}/assets/`, `${uMenuBinDir}/UMenu/UMenu`); // 资源
        os.copy(`${uMenuDir}/dist/Extension`, `${uMenuBinDir}/UMenu/UMenu/Extension`); // 扩展
        os.copy(`${rootDir}/LICENSE`, `${uMenuBinDir}/UMenu`);
        if (os.exists(`${uMenuDir}/README.md`)) {
            os.copy(`${uMenuDir}/README.md`, `${uMenuBinDir}/UMenu`);
        } else console.warn("No README.md found in UMenu");
        colorLog("green", "Copied UMenu");
        generatorManifests("UMenu", "UMenu.js", `${uMenuBinDir}/UMenu/UMenu`);

        console.log("Copying UMenuEdit...");
        os.mkdir(`${uMenuBinDir}/UMenuEdit`);
        os.mkdir(`${uMenuBinDir}/UMenuEdit/UMenuEdit`);
        os.copy(`${uMenuDir}/dist/UMenuEdit.js`, `${uMenuBinDir}/UMenuEdit/UMenuEdit/UMenuEdit.js`);
        os.copy(`${rootDir}/LICENSE`, `${uMenuBinDir}/UMenuEdit`);
        colorLog("green", "Copied UMenuEdit");
        generatorManifests("UMenuEdit", "UMenuEdit.js", `${uMenuBinDir}/UMenuEdit/UMenuEdit`);
    }

    // copy Clocks.js、Announcements.js
    {
        console.log("Copying Clocks.js...");
        const otherDir = `${projectsDir}/Other`;

        os.mkdir(`${binDir}/Clocks`);
        os.mkdir(`${binDir}/Clocks/Clocks`);
        os.copy(`${otherDir}/dist/Clocks.js`, `${binDir}/Clocks/Clocks/Clocks.js`);
        os.copy(`${rootDir}/LICENSE`, `${binDir}/Clocks`);

        console.log("Copying Announcements.js...");
        os.mkdir(`${binDir}/Announcements`);
        os.mkdir(`${binDir}/Announcements/Announcements`);
        os.copy(`${otherDir}/dist/Announcements.js`, `${binDir}/Announcements/Announcements/Announcements.js`);
        os.copy(`${rootDir}/LICENSE`, `${binDir}/Announcements`);

        colorLog("green", "Copied Clocks.js and Announcements.js");
        generatorManifests("Clocks", "Clocks.js", `${binDir}/Clocks/Clocks`);
        generatorManifests("Announcements", "Announcements.js", `${binDir}/Announcements/Announcements`);
    }
}

// Runing
colorLog("grey", `Runing path ${os.path}`);
buildAll();
copyAll();
