/*
 * evernote-jxa.js
 * Copyright (C) 2017 Reggie Zhang <reggy.zhang@gmail.com>
 * Licensed under the terms of The GNU Lesser General Public License (LGPLv3):
 * http://www.opensource.org/licenses/lgpl-3.0.html
 *
 */
'use-strict';
const runJxa = require('run-jxa');

function createNote(namedParamFilePath) {
    return runJxa.sync((namedParamFilePath) => {
        var EN = Application("Evernote");
        var app = Application.currentApplication();
        app.includeStandardAdditions = true;

        var file = app.openForAccess(Path(namedParamFilePath), { writePermission: false });
        var paramObj;
        if (app.getEof(file) > 0) {
            paramObj = JSON.parse($.NSString.alloc.initWithUTF8String(app.read(file)).cString);
            app.closeAccess(file);
        }

        if (paramObj.attachments) {
            paramObj.attachments.forEach(function (item, index) {
                paramObj.attachments[index] = Path(item);
            });
        }

        return EN.createNote(paramObj).id().trim();

    }, [namedParamFilePath]);
}
function deleteNote(noteId) {
    return runJxa.sync((noteId) => {
        const EN = Application("Evernote");
        var notebookName;
        try {
            var notebookName = null;
            console.log("to be deleted: " + noteId);
            var note = EN.notebooks()[0].notes.byId(noteId);
            notebookName = note.notebook().name();
            EN.delete(note);
        } finally {
            return notebookName;
        }
    }, [noteId]);
}
function createNotebook(nbName) {
    if (!findNotebook(nbName)) {
        return runJxa.sync((nbName) => {
            return Application("Evernote").createNotebook(nbName, { withType: "local only" });
        }, [nbName]);
    }
}

function deleteNotebook(nbName) {
    if (findNotebook(nbName)) {
        return runJxa.sync((nbName) => {
            const EN = Application("Evernote");
            EN.delete(app.notebooks.byName(nbName));
        }, [nbName]);
    }
}

function findNotebook(nbName) {
    return runJxa.sync((nbName) => {
        return Application("Evernote").notebooks().find(elem => elem.name() === nbName) !== undefined;
    }, [nbName]);
}

module.exports = {
    createNote, deleteNote, createNotebook, findNotebook, deleteNotebook
}