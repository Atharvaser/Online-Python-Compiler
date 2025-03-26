document.addEventListener('DOMContentLoaded', function() {
    const editor = CodeMirror.fromTextArea(document.getElementById('code'), {
        mode: 'python',
        theme: 'material',
        lineNumbers: true,
        indentUnit: 4,
        smartIndent: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        lineWrapping: true,
    });

    editor.setValue("#Write your code here...!\n#Hope you enjoy coding wtih us..!! \n#By Atharv Khandelwal!! :) \nprint('Hello World!')");

    async function compileCode() {
        const code = editor.getValue();
        const outputElement = document.getElementById("output");
        outputElement.textContent = "Running...";

        const inputPattern = /input\((?:'|"|`)(.*?)(?:'|"|`)\)/g;
        const inputPrompts = [...code.matchAll(inputPattern)].map(match => match[1]);

        if(inputPrompts.length > 0){
            outputElement.innerHTML = '<h3>Waiting for input...</h3>';


            const inputsContainer = document.createElement('div');
            inputsContainer.classList.add('inputs-container');

            inputPrompts.forEach((prompt, index) => { // Corrected 'promt' to 'prompt'
                const inputGroup = document.createElement('div');
                inputGroup.classList.add('input-group');

                const label = document.createElement('label');
                label.setAttribute('for', `input-${index}`);
                label.textContent = prompt; // Corrected 'promt' to 'prompt'

                const input = document.createElement('input');
                input.type = 'text';
                input.id = `input-${index}`;
                input.classList.add('user-input'); // Ensure this class is added

                inputGroup.appendChild(label);
                inputGroup.append(input);

                inputsContainer.appendChild(inputGroup);
            });

            outputElement.appendChild(inputsContainer);

            const submitButton = document.createElement('button');
            submitButton.id = 'submit-inputs-btn';
            submitButton.textContent = 'Submit Inputs';
            submitButton.classList.add('run-btn'); // Add this line to apply the same styles
            outputElement.appendChild(submitButton);

            submitButton.addEventListener('click', submitInputs);
            return;
        }

        await executeCode(code);
    }

    async function executeCode(code, inputs = []){
        const outputElement = document.getElementById("output");
        outputElement.textContent = 'Running...';

        inputs.forEach((input, index) => {
            code = code.replace(/input\((?:'|"|`)(.*?)(?:'|"|`)\)/, `"${input}"`);
        });

        try{
            const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language: "python",
                    version: "3.10.0",
                    files: [{content: code }]
                })
            });

            if(!response.ok) throw new Error("Failed to compile code");

            const result = await response.json();
            const output = result.run.output || "No output";

            outputElement.innerHTML = `> ${output}`;
        }catch (error){
            outputElement.textContent = "Error: " + error.message;
        }
    }


    function submitInputs(){
        const inputs = Array.from(document.querySelectorAll(".user-input")).map(input => input.value);
        const code = editor.getValue();
        executeCode(code, inputs);
    }

    const runButton = document.querySelector('.run-btn'); // Corrected to select the button with class 'run-btn'
    runButton.addEventListener('click', compileCode);

    
})