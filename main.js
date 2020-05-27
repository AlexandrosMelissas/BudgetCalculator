var budgetController = (function () {

    var Income = function (id,description,value) {

        this.id = id,
        this.description = description,
        this.value = value

    }
    
    var Expense = function (id,description,value) {

        this.id = id
        this.description = description
        this.value = value

    }

    var data = {
        allItems : {
            income : [],
            expense : []
        },
        totals : {
            income : 0,
            expense : 0
        },
        budget : 0
    }

    var calculateTotal = (type) => {
        var sum = 0
        data.allItems[type].forEach((current) => {
            sum += current.value
        })
        data.totals[type] = sum
        return sum
    }

    return {

        addData : (type,des,val) => {
            var newItem,ID
            // Generate ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0
            }
            // Create new Expense or Income
            if(type === 'income') {
               newItem = new Income(ID,des,val)
            } else if(type === 'expense') {
               newItem = new Expense(ID,des,val)
            }

            // Add it to the array
            data.allItems[type].push(newItem)
            // Increment the number of items
            data.totals[type]++

            return newItem

        },
        deleteItem : (type,id) => {
            data.allItems[type].forEach((item,index) => {
                if(item.id == id){
                    data.allItems[type].splice(index,1)
                    return item
                }
            })
        },
        calculateBudget : (value,type) => {
            calculateTotal('income')
            calculateTotal('expense')
            data.budget = data.totals.income - data.totals.expense
        },
        getBudget : () => {
            return {
                totalIncome : data.totals.income,
                totalExpense : data.totals.expense,
                totalBudget : data.budget
            }
        }

    }

})()


var UIController = (function () {

    // Declare all query selectors
    var querySelectors = {
        description : '.description',
        value : '.value',
        select : '.select',
        submit : '.submit',
        main_container : '.main_container',
        income_container : '.income_container',
        expense_container : '.expense_container',
        total_income_number : '.budget_income-number',
        total_expense_number : '.budget_expense-number',
        total_budget : '.budget_total-number',
        delete : '.delete'
    }

    return {
        getInput : () => {
            return {
                description :  document.querySelector(querySelectors.description).value,
                value : parseFloat(document.querySelector(querySelectors.value).value),
                type : document.querySelector(querySelectors.select).value
            }
        },
        getQuerySelectors : () => {
            return querySelectors
        },
        showItem : (newItem,type) => {
            let output
            if(type==='income') {
                output = `
                    <div class="item_container ${type}" id="income-${newItem.id}"> 
                     <div class="item_description">${newItem.description}</div>
                        <div class="item_value">+ ${newItem.value}</div>
                         <ion-icon class="delete" name="close-circle-outline"></ion-icon>
                    </div>
                `

                document.querySelector(querySelectors.income_container).insertAdjacentHTML('beforeend',output)

            } else if(type === 'expense') {
                output = `
                <div class="item_container ${type}" id="expense-${newItem.id}"> 
                 <div class="item_description">${newItem.description}</div>
                    <div class="item_value">- ${newItem.value}</div>
                     <ion-icon class="delete" name="close-circle-outline"></ion-icon>
                </div>
            `
            document.querySelector(querySelectors.expense_container).insertAdjacentHTML('beforeend',output)

            }
        },
        deleteItem : (type,id) => {
            document.querySelectorAll('.item_container').forEach((item) => {
                if(item.id == `${type}-${id}`){
                    item.remove()
                }
            })
        },
        updateBudget: (budget) => {
            document.querySelector(querySelectors.total_income_number).textContent = budget.totalIncome
            document.querySelector(querySelectors.total_expense_number).textContent = budget.totalExpense
            document.querySelector(querySelectors.total_budget).textContent = budget.totalBudget
        },
        clearInput : () => {
            document.querySelector(querySelectors.description).value = ''
            document.querySelector(querySelectors.value).value = ''
            document.querySelector(querySelectors.description).focus()
        }
    }

})()


var controller = (function (budgetCtrl,UICtrl) {

    // Declare all event listeners
    var eventListeners = function () {

        var querySelectors = UIController.getQuerySelectors()
        document.querySelector(querySelectors.submit).addEventListener('click',ctrlAddItem)

        document.querySelector(querySelectors.description).addEventListener('keypress',function (event) {
            if(event.keyCode === 13) {
                ctrlAddItem()
            }
        })

        document.querySelector(querySelectors.value).addEventListener('keypress',function (event) {
            if(event.keyCode === 13) {
                ctrlAddItem()
            }
        })

        document.querySelector(querySelectors.main_container).addEventListener('click',ctrlDeleteItem)
    }

    // Update the budget
    var updateBudget = function () {
        budgetCtrl.calculateBudget()
        var newBudget = budgetCtrl.getBudget()
        UICtrl.updateBudget(newBudget)
        
    }

    // Delete an item
    var ctrlDeleteItem = function (event) {
        if(event.target.classList.contains('delete')) {
           let type = event.target.parentElement.id.split('-')[0]
           let id = event.target.parentElement.id.split('-')[1]

           var deletedItem = budgetCtrl.deleteItem(type,id)
           UICtrl.deleteItem(type,id)
           updateBudget()
        }
    }

    // Add an item
    var ctrlAddItem = function () {
       var input =  UICtrl.getInput()
       if(input.description !== "" && Number(input.value) && input.value > 0) {
            var newItem = budgetCtrl.addData(input.type,input.description,input.value)
            updateBudget()
            UICtrl.showItem(newItem,input.type)
            UICtrl.clearInput()
       }
       
    }


    return {
        init : () => {
            console.log("App has started")
            eventListeners()
        }
    }


})(budgetController,UIController)



controller.init()