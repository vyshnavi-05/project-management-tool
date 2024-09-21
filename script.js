  
var taskObj = {     key: "projects",     addProject: function() { 
        if 
(document.getElementById("addproject").value == "") {             swal("Please enter User name");             return false; 
        } 
        var data = this.getAllProjects();         var project = {             id: data.length,             name: 
document.getElementById("add-
project").value, 
            tasks: [], 
        }; 
        data.push(project);         localStorage.setItem(this.key, 
JSON.stringify(data));         this.loadAllProjects();         this.showAllTasks(); 
    }, 
    getAllProjects: function() {         if (!localStorage.getItem(this.key)) 
{             localStorage.setItem(this.key, "[]"); 
        } 
        return 
JSON.parse(localStorage.getItem(this.key)); 
    }, 
    getProject: function(id) {         var projects = 
this.getAllProjects();         return projects.find(project => 
project.id == id) || null; 
    }, 
    loadAllProjects: function() {         var projects = 
this.getAllProjects().reverse();         var html = "<option value=''>Select User</option>";         projects.forEach(project => {             html += <option 
value='${project.id}'>${project.name}</option >; 
        }); 
        document.getElementById("add-
task-project").innerHTML = html;         document.getElementById("form-
task-hour-calculator-all-projects").innerHTML = html; 
    }, 
    addTask: function(form) {         var project = form.project.value;         var task = form.task.value;         var projects = 
this.getAllProjects();         var projectToUpdate = projects.find(p => p.id == project);         if (projectToUpdate) {             projectToUpdate.tasks.push({ 
                id: 
projectToUpdate.tasks.length, 
                name: task,                 status: "Progress",                 isStarted: false,                 logs: [],                 started: 
this.getCurrentTimeInTaskStartEndFormat(), 
                ended: "", 
            }); 
            localStorage.setItem(this.key, JSON.stringify(projects)); 
        } 
        
jQuery("#addTaskModal").modal("hide");         jQuery(".modal-
backdrop").remove();         this.showAllTasks();         return false; 
    }, 
    showAllTasks: function() {         var html = "";         var projects = 
this.getAllProjects(); 
 
        projects.forEach(project => { project.tasks.reverse().forEach(task => { 
                html += `<tr> 
                    <td>${task.name}</td> 
                    <td>${project.name}</td> 
                    <td>${task.isStarted ? 
"<label class='started'>Started</label>" : (task.status == "Completed" ? "<label class='completed'>Completed</label>" : 
task.status)}</td> 
                    
<td>${this.calculateDuration(task.logs)}</td> 
                    <td>${task.status == 
"Completed" ? ${task.started} to 
${task.ended} : task.started}</td> 
                    
<td>${this.createStatusChangeDropdown(proj ect.id, task)}</td> 
                </tr>`; 
            }); 
        }); 
 
        document.getElementById("all-
tasks").innerHTML = html; 
    }, 
    calculateDuration: function(logs) {         var duration = logs.reduce((acc, 
log) => {             if (log.endTime) acc += 
log.endTime - log.startTime; 
            return acc; 
        }, 0); 
var hours = Math.floor(duration / 
3600000); 
        var minutes = 
Math.floor((duration % 3600000) / 60000);         var seconds = 
Math.floor((duration % 60000) / 1000); 
        return 
${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, 
"0")}:${seconds.toString().padStart(2, "0")}; 
    }, 
    createStatusChangeDropdown: 
function(projectId, task) {         var html = `<form method='POST' 
id='form-change-task-status${projectId}${task.id}'> 
            <input type='hidden' name='project' value='${projectId}'> 
            <input type='hidden' name='task' value='${task.id}'> 
            <select class='form-control' name='status' 
onchange='taskObj.changeTaskStatus(this);' data-form-id='form-change-task-status${projectId}${task.id}'> 
                <option value=''>Change status</option> 
                ${task.isStarted ? "<option value='stop'>Stop</option>" : "<option value='start'>Start</option>"} 
                ${task.status == "Progress" ? 
"<option value='complete'>Mark as 
Completed</option>" : "<option value='progress'>Make in Progress Again</option>"} 
                <option 
value='delete'>Delete</option> 
            </select>         </form>`;         return html; 
    }, 
    
getCurrentTimeInTaskStartEndFormat: 
function() {         let current_datetime = new Date();         let formatted_date = 
${current_datetime.getFullYear()}-
${(current_datetime.getMonth() + 
1).toString().padStart(2, "0")}-
${current_datetime.getDate().toString().padSta rt(2, "0")} 
${current_datetime.getHours().toString().padS tart(2, 
"0")}:${current_datetime.getMinutes().toStrin g().padStart(2, 
"0")}:${current_datetime.getSeconds().toStrin g().padStart(2, "0")};         return formatted_date; 
    }, 
    changeTaskStatus: function(self) {         if (self.value === "") return;         var formId = 
self.getAttribute("data-form-id");         var form = 
document.getElementById(formId); 
var projects = 
this.getAllProjects();         var projectToUpdate = 
projects.find(p => p.id == form.project.value);         var taskToUpdate = 
projectToUpdate.tasks.find(t => t.id == form.task.value); 
 
        switch (self.value) {             case "delete": 
                
this.deleteTask(taskToUpdate, projectToUpdate, projects); 
                break;             case "complete": 
                
this.completeTask(taskToUpdate); 
                break;             case "progress": 
                
this.markInProgress(taskToUpdate); 
                break;             case "start":                 this.startTask(taskToUpdate);                 break;             case "stop":                 this.stopTask(taskToUpdate); 
                break; 
        } 
 
localStorage.setItem(this.key, 
JSON.stringify(projects));         this.showAllTasks();         self.value = ""; // Reset dropdown 
to default value 
    }, 
    deleteTask: function(task, project, 
allProjects) {         swal({             title: "Are you sure?",             text: "Deleting the task will 
delete its hours too.",             icon: "warning",             buttons: true,             dangerMode: true,         }).then((willDelete) => {             if (willDelete) {                 var taskIndex = 
project.tasks.indexOf(task);                 if (taskIndex !== -1) 
project.tasks.splice(taskIndex, 1);                 localStorage.setItem(this.key, 
JSON.stringify(allProjects));                 this.showAllTasks(); 
            } 
        }); 
    }, 
    completeTask: function(task) {         task.status = "Completed";         task.isStarted = false; task.ended = 
this.getCurrentTimeInTaskStartEndFormat();         task.logs.forEach(log => {             if (!log.endTime) log.endTime = new Date().getTime(); 
        }); 
    }, 
    markInProgress: function(task) {         task.status = "Progress";         task.isStarted = false; 
    }, 
    startTask: function(task) {         task.isStarted = true;         task.logs.push({             id: task.logs.length,             startTime: new 
Date().getTime(),             endTime: 0 
        }); 
    }, 
    stopTask: function(task) {         task.isStarted = false;         task.logs.forEach(log => {             if (!log.endTime) log.endTime = new Date().getTime(); 
        }); 
    }, 
    deleteProject: function(self) {         if (self.project.value == "") {             swal("Please select a User to 
delete");             return false;         }         swal({             title: "Are you sure?",             text: "Deleting the User will 
delete its tasks too.",             icon: "warning",             buttons: true,             dangerMode: true,         }).then((willDelete) => {             if (willDelete) {                 var projects = 
this.getAllProjects();                 var projectIndex = 
projects.findIndex(p => p.id == self.project.value);                 
if (projectIndex !== -1) 
projects.splice(projectIndex,1);                 localStorage.setItem(this.key, 
JSON.stringify(projects)); 
                this.loadAllProjects();                 this.showAllTasks(); 
            }         });         return false; 
    } 
}; 
 
window.addEventListener("load", 
function(){     taskObj.loadAllProjects();     taskObj.showAllTasks();     setInterval(function() {         var dataStartedElements = 
document.querySelectorAll("td[data-started]");         dataStartedElements.forEach(td 
=> {             var dataStartedObj = 
JSON.parse(td.getAttribute("data-started")); 
            var project = 
taskObj.getProject(dataStartedObj.project); 
 
            if(!project) return; // If project is 
not found, exit loop 
 
            var task = project.tasks.find(t 
=> t.id == dataStartedObj.task); 
            if(!task || !task.isStarted) return; // If task is not found or not started, exit loop 
 
            var lastLog = 
task.logs[task.logs.length - 1];             if(!lastLog || lastLog.endTime) 
return;  // Ensure there's a log and no endTime set yet 
 
            var startTime = 
lastLog.startTime;             var currentDuration = (new 
Date().getTime() - startTime) / 1000; 
            var hours = 
Math.floor(currentDuration / 3600) % 24; 
            var minutes = 
Math.floor(currentDuration / 60) % 60; 
            var seconds = 
Math.floor(currentDuration % 60); 
 
            td.innerHTML = 
${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, 
'0')}:${String(seconds).padStart(2, '0')}; 
        }); 
    }, 1000); 
}); 
 
console.log("Script is loaded"); 
 
setInterval(function() {     console.log("Interval running");     var dataStartedElements = 
document.querySelectorAll("td[data-started]"); 
    
console.log(dataStartedElements.length + " data-started elements found");     dataStartedElements.forEach(td => {         var dataStartedObj = 
JSON.parse(td.getAttribute("data-started"));         var project = 
taskObj.getProject(dataStartedObj.project); 
 
        if(!project) return; // If project is not found, exit loop 
 
        var task = project.tasks.find(t => 
t.id == dataStartedObj.task);         if(!task || !task.isStarted) return; // If task is not found or not started, exit loop 
 
        var lastLog = 
task.logs[task.logs.length - 1];         if(!lastLog || lastLog.endTime) 
return;  // Ensure there's a log and no endTime set yet 
 
        var startTime = lastLog.startTime;         var currentDuration = (new 
Date().getTime() - startTime) / 1000;         var hours = 
Math.floor(currentDuration / 3600) % 24;         var minutes = 
Math.floor(currentDuration / 60) % 60;         var seconds = 
Math.floor(currentDuration % 60); 
 
        td.innerHTML = 
${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, 
'0')}:${String(seconds).padStart(2, '0')}; 
    }); 
}, 1000); 
 
  
