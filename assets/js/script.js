// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-analytics.js";
import { getDatabase, ref, set,push, onValue, update,remove,onChildRemoved } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCGHOLx097GWFxPRK2vZQLaYzmK65MnAho",
    authDomain: "learn-firebase-373aa.firebaseapp.com",
    databaseURL: "https://learn-firebase-373aa-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "learn-firebase-373aa",
    storageBucket: "learn-firebase-373aa.appspot.com",
    messagingSenderId: "302280307940",
    appId: "1:302280307940:web:76eac6db054c742b3568f1",
    measurementId: "G-6CQJDP4VHD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getDatabase();

// Tạo công việc
const todoCreate = document.querySelector("#todo-app__create");

todoCreate.addEventListener("submit", function (e) {
    e.preventDefault();
    const content = e.target.elements.content.value;
    if(content) {
        set(push(ref(db, 'todos/')), {
            content : content,
            complete : false,
        });
    }
    e.target.elements.content.value = "";
});


// Hiển thị công việc ra ngoài giao diện
onValue(ref(db, 'todos/'),(snapshot) => {
    if (!snapshot.exists()) {
        let html = "";
        html += `
            <p class="status-child">
                <img src="timeToChild.svg" alt="celebration"/>
                Time to chill!  You have no todos.
            </p>
        `
        const todoList = document.querySelector(".todo-app__list");
        todoList.innerHTML = html;

        const controlButton = document.querySelector("#control-buttons");
        controlButton.style.display = "none";
    } else {
        const controlButton = document.querySelector("#control-buttons");
        controlButton.style.display = "block";
        toggleTodoStatus(snapshot);
    }

})

// Xoá công việc
const deleteTodo = (completedTodoCount) => {
    // Gán sự kiện click cho nút "Delete" của từng công việc
    const deleteButtons = document.querySelectorAll('.todo-app__item-button--delete');
    const handleDeleteClick = (event) => {
        const button = event.currentTarget;
        const todoId = button.getAttribute('button-delete');
        const todoRef = ref(db, `todos/${todoId}`);
        const todoItem = button.closest('.todo-app__item');
        const isCompleted = todoItem.classList.contains('todo-app__item--completed');

        remove(todoRef)
            .then(()=> {
    
                todoItem.remove();
                if (isCompleted) {
                    completedTodoCount--;
                    updateCompletedPercentage();
                }
            })
            .catch((error) => {
                console.error('Error removing data:', error);
            });
    };
    deleteButtons.forEach(button => {
        button.addEventListener('click', handleDeleteClick);
    });
}

const updateCompletedPercentage = () => {
    const completedTodosContainer = document.querySelector(".todo-app__list-completed");
        const percentageDisplay = completedTodosContainer.querySelector(".todo-app__completed-percentage");
    
        const totalTodoCount = document.querySelectorAll(".todo-app__item").length;
        const completedPercentage = totalTodoCount > 0 ? (completedTodoCount / totalTodoCount) * 100 : 0;
    
        if (completedPercentage > 0) {
            percentageDisplay.textContent = `${completedPercentage.toFixed(2)}% completed`;
        } else {
            percentageDisplay.remove();
        }
};

// Xoá tất cả công việc
const clearAllButton = () => {
    const clearAllButton = document.getElementById('clearAllButton');
    clearAllButton.addEventListener('click', () => {
        const todosRef = ref(db, 'todos/');
        remove(todosRef)
            .then(() => {
                const todoItems = document.querySelectorAll('.todo-app__item');
                const percentageItem = document.querySelector('.todo-app__completed-percentage');
                todoItems.forEach(todoItem => {
                    todoItem.remove();
                });
                percentageItem.remove();
                localStorage.removeItem("completedTodoState");
            })
            .catch((error) => {
                console.error('Error removing data:', error);
            });
    });
}

const toggleTodoStatus = (snapshot) => {

    let completedTodoCount = 0;
    let totalTodoCount = 0;

    const todoComplete = document.querySelector(".todo-app__list-completed");
    const todoList = document.querySelector(".todo-app__list");
    const headerHTML = `
    <div class="todo-app__item">
        <div class="todo-app__item-list">List</div>
        <div class="todo-app__item-status">Status</div>
    </div>  
    `;
    todoList.innerHTML = "";
    todoList.insertAdjacentHTML("beforeend", headerHTML);

    if (todoComplete) {
        todoComplete.innerHTML = "";
    }
    const hideCompletedTodo = document.querySelector("#hide-complete");
    let hasCompletedTodo = false;
    let hasUncompletedTodo = false;

    snapshot.forEach(childSnapshot => {
        const childKey = childSnapshot.key;
        const childData = childSnapshot.val();

        totalTodoCount++;

        if (childData.complete) {

            completedTodoCount++;

            hasCompletedTodo = true;

            hideCompletedTodo.style.display = "inline-block";

            // Hiển thị công việc đã hoàn thành
            let html = `
                <div class="todo-app__item todo-app__item--completed">
                    <div class="todo-app__item-content">${childData.content}</div>
                    <div class="todo-app__item-action">
                        <button class="todo-app__item-button todo-app__item-button--edit" button-edit="${childKey}">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="todo-app__item-button todo-app__item-button--undo" button-undo="${childKey}">
                            <i class="fa-solid fa-rotate-left"></i>
                        </button>
                        <button class="todo-app__item-button todo-app__item-button--delete" button-delete="${childKey}">
                            <i class="fa-solid fa-delete-left"></i>
                        </button>
                    </div>
                </div>
            `;

            
            todoComplete.insertAdjacentHTML("beforeend", html);
            
        } else {
            hasUncompletedTodo = true;
            
            // Hiển thị công việc chưa hoàn thành
            let html = `
                <div class="todo-app__item">
                    <div class="todo-app__item-content">${childData.content}</div>
                    <div class="todo-app__item-action">
                        <button class="todo-app__item-button todo-app__item-button--edit" button-edit="${childKey}">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="todo-app__item-button todo-app__item-button--complete" button-complete="${childKey}">
                            <i class="fa-solid fa-check"></i>
                        </button>
                        <button class="todo-app__item-button todo-app__item-button--delete" button-delete="${childKey}">
                            <i class="fa-solid fa-delete-left"></i>
                        </button>
                    </div>
                </div>
            `;


            todoList.insertAdjacentHTML("beforeend", html);
        }
    });

    const todoListComplete = document.querySelector(".todo-app__list-completed");

    // Tính phần trăm công việc đã hoàn thành
    const completedPercentage = totalTodoCount > 0 ? (completedTodoCount / totalTodoCount) * 100 : 0;
    if (completedPercentage > 0) {
        const percentageDisplay = `
            <p class="todo-app__completed-percentage">
                Completed tasks: ${completedPercentage.toFixed(2)}% 
            </p>
        `;
        // Hiển thị phần trăm công việc đã hoàn thành

        todoListComplete.insertAdjacentHTML("afterbegin", percentageDisplay);
    }

    if (hasCompletedTodo) {
        hideCompletedTodo.style.display = "inline-block";
    } else {
        hideCompletedTodo.style.display = "none";
    }

    if (!hasUncompletedTodo ) {
        const todoItem = document.querySelector(".todo-app__item");
        todoItem.style.display = "none";
        const statusChild = `
            <p class="status-child">
                <img src="timeToChild.svg" alt="celebration"/>
                Time to chill! You have no todos.
            </p>
        `;
        todoList.insertAdjacentHTML("beforeend", statusChild);
    }

    // Xử lý sự kiện click cho các nút
    const listButtonComplete = document.querySelectorAll("[button-complete]");
    listButtonComplete.forEach(buttonComplete => {
        buttonComplete.addEventListener("click", function () {
            const todoKey = buttonComplete.getAttribute("button-complete");
            update(ref(db, `todos/${todoKey}`), { complete: true });
        });
    });

    const listButtonUndo = document.querySelectorAll("[button-undo]");
    listButtonUndo.forEach(buttonUndo => {
        buttonUndo.addEventListener("click", function () {
            const todoKey = buttonUndo.getAttribute("button-undo");
            update(ref(db, `todos/${todoKey}`), { complete: false });
        });
    });

    deleteTodo(completedTodoCount);
    editTodo();
    clearAllButton();
};

// Sửa công việc
const editTodo = () => {
    const editButtonTodos = document.querySelectorAll("[button-edit]");
    
    editButtonTodos.forEach(buttonEdit => {
        buttonEdit.addEventListener("click", function () {
            const todoKey = buttonEdit.getAttribute("button-edit");
            const todoItem = buttonEdit.closest(".todo-app__item");
            let currentContent = todoItem.querySelector(".todo-app__item-content").textContent;
            let currentStatus = currentContent;
            currentContent = "";

            const formHtml = `
                <form class="TodoForm">
                    <input type="text" class="todo-input" value="${currentContent}"/> 
                    <button type="submit" class='todo-btn'>Update Task</button>
                </form>
            `;
            todoItem.innerHTML = formHtml;
            const updateForm = todoItem.querySelector(".TodoForm");
            
            updateForm.addEventListener("submit", function (event) {
                event.preventDefault();
                const updatedContent = updateForm.querySelector(".todo-input").value;
                if (currentStatus === updatedContent) {
                    console.log("Nội dung không thay đổi, không cần cập nhật.");
                } else {
                    update(ref(db, `todos/${todoKey}`), {
                        content: updatedContent
                    });
                }
            });
        });
    });
};

// Ẩn công việc hoàn thành or hiển thị công việc hoàn thành

const hideCompletedTodo = document.querySelector("#hide-complete");
if (hideCompletedTodo) {
    const todoComplete = document.querySelector(".todo-app__list-completed");
    hideCompletedTodo.addEventListener("click", function () {
        todoComplete.style.display = todoComplete.style.display === "none" ? "block" : "none";
        if (todoComplete.style.display === "none") { 
            const controlButton = document.querySelector("#control-buttons");
            controlButton.style.marginBlock = "5px";
        }
        hideCompletedTodo.textContent = todoComplete.style.display === "none" ? "Show completed" : "Hide completed";
    })
}