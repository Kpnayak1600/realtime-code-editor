import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/theme/3024-day.css';
import 'codemirror/theme/3024-night.css';
import 'codemirror/theme/eclipse.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/rubyblue.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/css/css';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange, username }) => {
    const editorRef = useRef(null);
    const modeOptions = {
        javascript: { name: 'javascript', json: true },
        python: { name: 'python' },
        cplusplus: { name: 'text/x-c++src' },
        java: { name: 'text/x-java' },
        xml: { name: 'xml' },
    };
    const themeOptions = [
        'dracula',
        '3024-day',
        '3024-night',
        'eclipse',
        'material',
        'rubyblue',
    ];

    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(
                document.getElementById('realtimeEditor'),
                {
                    mode: modeOptions.javascript,
                    theme: 'dracula',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );

            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });

                    editorRef.current.on('keyup', () => {

                        socketRef.current.emit("typing", {
                            username,
                        });

                        setTimeout(() => {
                            socketRef.current.emit("typing", {

                                username: "",
                            });

                        }, 1000)
                    })
                }
            });
        }
        init();
    }, []);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null) {
                    editorRef.current.setValue(code);
                }
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        };
    }, [socketRef.current]);

    const handleModeChange = (e) => {
        const mode = e.target.value;
        editorRef.current.setOption('mode', modeOptions[mode]);
    };

    const handleThemeChange = (e) => {
        const theme = e.target.value;
        editorRef.current.setOption('theme', theme);
    };

    const handleRunCode = () => {
        const code = editorRef.current.getValue();
        switch (editorRef.current.getOption("mode").name) {
            case "javascript":
                try {
                    eval(code);
                } catch (e) {
                    console.error(e);
                }
                break;
            case "python":
                // Execute the Python code using a runtime environment

                break;
            case "text/x-c++src":
                // Execute the C++ code using a runtime environment

                break;
            case "text/x-java":
                // Execute the Java code using a runtime environment

                break;
            case "xml":
                // Execute the XML code using a runtime environment

                break;
            default:
                break;
        }
    };

    return (
        <>
            <div className="seBox">
                <div>
                    <label htmlFor="mode-select" className="seLang">Language:</label>
                    <select id="mode-select" onChange={handleModeChange}>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cplusplus">C++</option>
                        <option value="java">Java</option>
                        <option value="xml">XML</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="theme-select" className="seLang">Theme:</label>
                    <select id="theme-select" onChange={handleThemeChange}>
                        {themeOptions.map((theme) => (
                            <option key={theme} value={theme}>
                                {theme}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <textarea id="realtimeEditor"></textarea>
            {/* <button onClick={handleRunCode}>Run</button> */}
        </>);
};

export default Editor;
