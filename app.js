// Application State
let appState = {
  company: {
    name: "Sample Startup",
    current_cash: 600000,
    monthly_revenue: 30000,
    employees: 5,
    product_price: 99,
    expenses: [
      {id: "exp1", name: "Salaries", amount: 35000, type: "fixed"},
      {id: "exp2", name: "Marketing", amount: 8000, type: "variable"},
      {id: "exp3", name: "Operations", amount: 5000, type: "fixed"},
      {id: "exp4", name: "Development", amount: 2000, type: "variable"}
    ]
  },
  usage: {
    scenarios_tested: 0,
    reports_generated: 0,
    session_cost: 0
  },
  scenarios: {
    hiring: {
      new_hires: 2,
      cost_per_hire: 15000
    },
    marketing: {
      additional_spend: 10000,
      roi_multiplier: 1.5
    },
    pricing: {
      price_change_percent: 10,
      demand_elasticity: -0.5
    }
  },
  charts: {
    hiring: null,
    marketing: null,
    pricing: null
  },
  isEditMode: false,
  hasUnsavedChanges: false,
  collapsedSections: {
    basic: true,
    expenses: true,
    templates: true,
    'import-export': true
  },
  showAllExpenses: false
};

// Business Templates
const businessTemplates = {
  tech_startup: {
    name: "Tech Startup",
    current_cash: 500000,
    monthly_revenue: 25000,
    employees: 8,
    product_price: 149,
    expenses: [
      {name: "Engineering Salaries", amount: 45000, type: "fixed"},
      {name: "Marketing & Growth", amount: 12000, type: "variable"},
      {name: "Infrastructure", amount: 3000, type: "fixed"},
      {name: "Office & Operations", amount: 6000, type: "fixed"},
      {name: "Legal & Compliance", amount: 2000, type: "variable"}
    ]
  },
  small_business: {
    name: "Small Business",
    current_cash: 150000,
    monthly_revenue: 40000,
    employees: 3,
    product_price: 75,
    expenses: [
      {name: "Staff Wages", amount: 18000, type: "fixed"},
      {name: "Rent", amount: 8000, type: "fixed"},
      {name: "Inventory", amount: 12000, type: "variable"},
      {name: "Marketing", amount: 3000, type: "variable"},
      {name: "Utilities", amount: 2000, type: "fixed"}
    ]
  },
  event_organizer: {
    name: "Event Organizer",
    current_cash: 200000,
    monthly_revenue: 35000,
    employees: 4,
    product_price: 199,
    expenses: [
      {name: "Team Salaries", amount: 20000, type: "fixed"},
      {name: "Venue Costs", amount: 15000, type: "variable"},
      {name: "Marketing & Promotion", amount: 8000, type: "variable"},
      {name: "Equipment & Setup", amount: 5000, type: "variable"},
      {name: "Administration", amount: 3000, type: "fixed"}
    ]
  }
};

// Utility Functions
function formatCurrency(amount) {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount.toLocaleString()}`;
}

function formatNumber(num) {
  return num.toLocaleString();
}

function updateLastUpdated() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
  document.getElementById('last-updated').textContent = timeString;
}

function calculateTotalBurn() {
  return appState.company.expenses.reduce((total, expense) => total + expense.amount, 0);
}

function calculateRunway() {
  const totalBurn = calculateTotalBurn();
  return totalBurn > 0 ? appState.company.current_cash / totalBurn : 0;
}

function generateId() {
  return 'exp' + Date.now() + Math.random().toString(36).substr(2, 9);
}

function showNotification(message, type = 'success') {
  const toast = document.getElementById('notification-toast');
  const messageEl = document.getElementById('notification-message');
  
  messageEl.textContent = message;
  toast.className = `notification-toast ${type}`;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

function validateCompanyData() {
  const warnings = [];
  const totalBurn = calculateTotalBurn();
  const runway = calculateRunway();
  
  if (runway < 3) {
    warnings.push("Critical: Runway is less than 3 months");
  } else if (runway < 6) {
    warnings.push("Warning: Runway is less than 6 months");
  }
  
  if (totalBurn > appState.company.monthly_revenue * 2) {
    warnings.push("High burn rate compared to revenue");
  }
  
  if (appState.company.current_cash < totalBurn * 2) {
    warnings.push("Low cash reserves relative to burn rate");
  }
  
  return warnings;
}

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
  console.log('App initializing...');
  
  initializeApp();
  setupEventListeners();
  updateCompanyProfile();
  updateUsageStats();
  initializeCharts();
  updateAllScenarios();
  renderExpensesSummary();
  
  console.log('App initialized successfully');
});

function initializeApp() {
  showScenario('hiring');
  
  // Initialize all sections as collapsed
  Object.keys(appState.collapsedSections).forEach(section => {
    const sectionEl = document.getElementById(`${section}-section`);
    const toggleBtn = document.querySelector(`[data-section="${section}"] .section-toggle`);
    
    if (sectionEl && toggleBtn) {
      sectionEl.classList.remove('expanded');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Ensure edit mode is hidden initially
  appState.isEditMode = false;
  updateEditModeVisibility();
}

function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // Profile management
  const editBtn = document.getElementById('edit-profile-btn');
  const cancelBtn = document.getElementById('cancel-edit-btn');
  const saveBtn = document.getElementById('save-profile-btn');
  const resetBtn = document.getElementById('reset-default-btn');
  
  if (editBtn) {
    editBtn.addEventListener('click', function(e) {
      e.preventDefault();
      enterEditMode();
    });
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function(e) {
      e.preventDefault();
      cancelEdit();
    });
  }
  
  if (saveBtn) {
    saveBtn.addEventListener('click', function(e) {
      e.preventDefault();
      saveProfile();
    });
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', function(e) {
      e.preventDefault();
      resetToDefault();
    });
  }
  
  // FIXED: Section toggle functionality
  document.querySelectorAll('.profile-section__header').forEach(header => {
    header.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const section = header.dataset.section;
      console.log('Section header clicked:', section);
      toggleSection(section);
    });
  });
  
  // Expense management
  const addExpenseBtn = document.getElementById('add-expense-btn');
  if (addExpenseBtn) {
    addExpenseBtn.addEventListener('click', function(e) {
      e.preventDefault();
      addExpense();
    });
  }
  
  // Show all expenses button
  const showAllExpensesBtn = document.getElementById('show-all-expenses-btn');
  if (showAllExpensesBtn) {
    showAllExpensesBtn.addEventListener('click', function(e) {
      e.preventDefault();
      toggleExpensesView();
    });
  }
  
  // Template selection
  document.addEventListener('click', function(e) {
    if (e.target.closest('.template-card')) {
      const templateCard = e.target.closest('.template-card');
      const template = templateCard.dataset.template;
      console.log('Template selected:', template);
      applyTemplate(template);
    }
  });
  
  // Import/Export
  const exportBtn = document.getElementById('export-profile-btn');
  const importBtn = document.getElementById('import-profile-btn');
  const importInput = document.getElementById('import-profile-input');
  
  if (exportBtn) {
    exportBtn.addEventListener('click', exportProfile);
  }
  
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      importInput.click();
    });
  }
  
  if (importInput) {
    importInput.addEventListener('change', importProfile);
  }
  
  // Form inputs
  setupFormValidation();
  
  // Scenario tabs
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const scenario = e.target.dataset.scenario;
      showScenario(scenario);
      incrementScenariosCount();
    });
  });

  // Scenario sliders
  setupScenarioSliders();
  
  // Header buttons
  const refreshBtn = document.getElementById('refresh-data');
  const resetCountersBtn = document.getElementById('reset-counters');
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshData);
  }
  
  if (resetCountersBtn) {
    resetCountersBtn.addEventListener('click', resetCounters);
  }
  
  // Notification close
  const notificationClose = document.getElementById('notification-close');
  if (notificationClose) {
    notificationClose.addEventListener('click', () => {
      document.getElementById('notification-toast').classList.add('hidden');
    });
  }
  
  console.log('Event listeners setup complete');
}

// FIXED: Section Management Functions
function toggleSection(sectionName) {
  console.log('Toggling section:', sectionName);
  
  const isCurrentlyExpanded = !appState.collapsedSections[sectionName];
  const sectionEl = document.getElementById(`${sectionName}-section`);
  const toggleBtn = document.querySelector(`[data-section="${sectionName}"] .section-toggle`);
  
  console.log('Current state - expanded:', isCurrentlyExpanded);
  console.log('Section element:', sectionEl);
  console.log('Toggle button:', toggleBtn);
  
  if (sectionEl && toggleBtn) {
    // Update state
    appState.collapsedSections[sectionName] = isCurrentlyExpanded;
    
    if (!isCurrentlyExpanded) {
      // Expanding section
      console.log('Expanding section');
      sectionEl.classList.add('expanded');
      toggleBtn.setAttribute('aria-expanded', 'true');
      
      // Special handling for expenses section
      if (sectionName === 'expenses') {
        renderExpensesSummary();
        if (appState.isEditMode) {
          renderExpensesList();
        }
      }
      
      showNotification(`${sectionName} section expanded`, 'info');
    } else {
      // Collapsing section
      console.log('Collapsing section');
      sectionEl.classList.remove('expanded');
      toggleBtn.setAttribute('aria-expanded', 'false');
      
      showNotification(`${sectionName} section collapsed`, 'info');
    }
    
    console.log(`Section ${sectionName} ${!isCurrentlyExpanded ? 'expanded' : 'collapsed'}`);
  } else {
    console.error('Could not find section elements for:', sectionName);
  }
}

function expandSection(sectionName) {
  if (appState.collapsedSections[sectionName]) {
    toggleSection(sectionName);
  }
}

// Profile Management Functions
function enterEditMode() {
  console.log('Entering edit mode...');
  
  appState.isEditMode = true;
  
  // Expand basic section automatically
  if (appState.collapsedSections.basic) {
    toggleSection('basic');
  }
  
  updateEditModeVisibility();
  populateEditForm();
  
  const editBtn = document.getElementById('edit-profile-btn');
  if (editBtn) {
    editBtn.textContent = 'Editing...';
    editBtn.disabled = true;
  }
  
  console.log('Edit mode activated');
  showNotification('Entered edit mode', 'info');
}

function cancelEdit() {
  if (appState.hasUnsavedChanges) {
    if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
      return;
    }
  }
  
  exitEditMode();
  showNotification('Edit cancelled', 'info');
}

function exitEditMode() {
  console.log('Exiting edit mode...');
  
  appState.isEditMode = false;
  appState.hasUnsavedChanges = false;
  
  updateEditModeVisibility();
  
  const editBtn = document.getElementById('edit-profile-btn');
  if (editBtn) {
    editBtn.textContent = 'Edit Profile';
    editBtn.disabled = false;
  }
  
  updateDataStatus();
  console.log('Edit mode exited');
}

function updateEditModeVisibility() {
  // Toggle edit/view modes for each section
  const sections = ['basic', 'expenses'];
  
  sections.forEach(section => {
    const viewMode = document.getElementById(`${section}-view-mode`);
    const editMode = document.getElementById(`${section}-edit-mode`);
    
    if (viewMode && editMode) {
      if (appState.isEditMode) {
        viewMode.classList.add('hidden');
        editMode.classList.remove('hidden');
      } else {
        viewMode.classList.remove('hidden');
        editMode.classList.add('hidden');
      }
    }
  });
  
  // Show/hide edit actions card
  const editActionsCard = document.getElementById('edit-actions-card');
  if (editActionsCard) {
    if (appState.isEditMode) {
      editActionsCard.classList.remove('hidden');
    } else {
      editActionsCard.classList.add('hidden');
    }
  }
}

function markAsModified() {
  appState.hasUnsavedChanges = true;
  updateDataStatus();
}

function updateDataStatus() {
  const statusEl = document.getElementById('data-status');
  if (statusEl) {
    if (appState.hasUnsavedChanges) {
      statusEl.textContent = 'Modified';
      statusEl.className = 'status status--warning data-modified';
    } else {
      statusEl.textContent = 'Live Data';
      statusEl.className = 'status status--success';
    }
  }
}

function populateEditForm() {
  console.log('Populating edit form with current data...');
  
  const fields = [
    ['edit-company-name', appState.company.name],
    ['edit-current-cash', appState.company.current_cash],
    ['edit-monthly-revenue', appState.company.monthly_revenue],
    ['edit-employees', appState.company.employees],
    ['edit-product-price', appState.company.product_price]
  ];
  
  fields.forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (input) {
      input.value = value;
    }
  });
  
  renderExpensesList();
}

function saveProfile() {
  console.log('Saving profile...');
  
  // Validate all inputs first
  const inputs = document.querySelectorAll('input[type="number"]');
  let hasErrors = false;
  
  inputs.forEach(input => {
    if (input.closest('#basic-edit-mode')) {
      validateNumberInput(input);
      if (input.classList.contains('error')) {
        hasErrors = true;
      }
    }
  });
  
  if (hasErrors) {
    showNotification('Please fix validation errors before saving', 'error');
    return;
  }
  
  // Update company data
  const nameInput = document.getElementById('edit-company-name');
  const cashInput = document.getElementById('edit-current-cash');
  const revenueInput = document.getElementById('edit-monthly-revenue');
  const employeesInput = document.getElementById('edit-employees');
  const priceInput = document.getElementById('edit-product-price');
  
  if (nameInput) appState.company.name = nameInput.value;
  if (cashInput) appState.company.current_cash = parseInt(cashInput.value);
  if (revenueInput) appState.company.monthly_revenue = parseInt(revenueInput.value);
  if (employeesInput) appState.company.employees = parseInt(employeesInput.value);
  if (priceInput) appState.company.product_price = parseInt(priceInput.value);
  
  // Recalculate everything
  updateCompanyProfile();
  updateAllScenarios();
  renderExpensesSummary();
  updateLastUpdated();
  
  // Show validation warnings if any
  const warnings = validateCompanyData();
  if (warnings.length > 0) {
    showNotification(`Profile saved with warnings: ${warnings[0]}`, 'warning');
  } else {
    showNotification('Profile saved successfully!', 'success');
  }
  
  exitEditMode();
}

function resetToDefault() {
  if (!confirm('This will reset all company data to defaults. Are you sure?')) {
    return;
  }
  
  appState.company = {
    name: "Sample Startup",
    current_cash: 600000,
    monthly_revenue: 30000,
    employees: 5,
    product_price: 99,
    expenses: [
      {id: "exp1", name: "Salaries", amount: 35000, type: "fixed"},
      {id: "exp2", name: "Marketing", amount: 8000, type: "variable"},
      {id: "exp3", name: "Operations", amount: 5000, type: "fixed"},
      {id: "exp4", name: "Development", amount: 2000, type: "variable"}
    ]
  };
  
  populateEditForm();
  updateEditTotalBurn();
  markAsModified();
  showNotification('Reset to default values', 'success');
}

function applyTemplate(templateKey) {
  const template = businessTemplates[templateKey];
  if (!template) {
    console.error('Template not found:', templateKey);
    return;
  }
  
  if (!confirm(`This will replace your current data with the ${template.name} template. Continue?`)) {
    return;
  }
  
  console.log('Applying template:', templateKey);
  
  // Apply template data
  appState.company = {
    ...appState.company,
    name: template.name,
    current_cash: template.current_cash,
    monthly_revenue: template.monthly_revenue,
    employees: template.employees,
    product_price: template.product_price,
    expenses: template.expenses.map(expense => ({
      ...expense,
      id: generateId()
    }))
  };
  
  if (appState.isEditMode) {
    populateEditForm();
    updateEditTotalBurn();
    markAsModified();
  } else {
    updateCompanyProfile();
    updateAllScenarios();
    renderExpensesSummary();
  }
  
  showNotification(`Applied ${template.name} template`, 'success');
}

// Expenses Management
function renderExpensesSummary() {
  const container = document.getElementById('expenses-summary-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  const expensesToShow = appState.showAllExpenses ? appState.company.expenses : appState.company.expenses.slice(0, 3);
  
  expensesToShow.forEach(expense => {
    const div = document.createElement('div');
    div.className = 'expense-summary-item';
    div.innerHTML = `
      <span class="expense-name">${expense.name}</span>
      <span class="expense-amount">${formatCurrency(expense.amount)}</span>
    `;
    container.appendChild(div);
  });
  
  // Update show more/less button
  const showBtn = document.getElementById('show-all-expenses-btn');
  if (showBtn) {
    if (appState.company.expenses.length > 3) {
      showBtn.style.display = 'block';
      showBtn.textContent = appState.showAllExpenses ? 'Show Less' : `Show All (${appState.company.expenses.length})`;
    } else {
      showBtn.style.display = 'none';
    }
  }
}

function toggleExpensesView() {
  appState.showAllExpenses = !appState.showAllExpenses;
  renderExpensesSummary();
}

function renderExpensesList() {
  console.log('Rendering expenses list...');
  
  const container = document.getElementById('expenses-list');
  if (!container) {
    console.error('Expenses list container not found');
    return;
  }
  
  container.innerHTML = '';
  
  appState.company.expenses.forEach(expense => {
    const expenseEl = createExpenseItem(expense);
    container.appendChild(expenseEl);
  });
  
  updateEditTotalBurn();
}

function createExpenseItem(expense) {
  const div = document.createElement('div');
  div.className = 'expense-item';
  div.dataset.expenseId = expense.id;
  
  div.innerHTML = `
    <input type="text" value="${expense.name}" class="expense-name" placeholder="Expense name">
    <input type="number" value="${expense.amount}" class="expense-amount" min="0" step="1000">
    <select class="expense-type">
      <option value="fixed" ${expense.type === 'fixed' ? 'selected' : ''}>Fixed</option>
      <option value="variable" ${expense.type === 'variable' ? 'selected' : ''}>Variable</option>
    </select>
    <button type="button" class="expense-remove-btn" ${appState.company.expenses.length <= 1 ? 'disabled' : ''}>&times;</button>
  `;
  
  // Add event listeners
  const nameInput = div.querySelector('.expense-name');
  const amountInput = div.querySelector('.expense-amount');
  const typeSelect = div.querySelector('.expense-type');
  const removeBtn = div.querySelector('.expense-remove-btn');
  
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      updateExpenseField(expense.id, 'name', nameInput.value);
    });
  }
  
  if (amountInput) {
    amountInput.addEventListener('input', () => {
      updateExpenseField(expense.id, 'amount', parseInt(amountInput.value) || 0);
    });
  }
  
  if (typeSelect) {
    typeSelect.addEventListener('change', () => {
      updateExpenseField(expense.id, 'type', typeSelect.value);
    });
  }
  
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      removeExpense(expense.id);
    });
  }
  
  return div;
}

function updateExpenseField(expenseId, field, value) {
  const expense = appState.company.expenses.find(e => e.id === expenseId);
  if (expense) {
    expense[field] = value;
    updateEditTotalBurn();
    markAsModified();
    renderExpensesSummary(); // Update summary view as well
  }
}

function addExpense() {
  console.log('Adding new expense...');
  
  const newExpense = {
    id: generateId(),
    name: "New Expense",
    amount: 1000,
    type: "fixed"
  };
  
  appState.company.expenses.push(newExpense);
  renderExpensesList();
  renderExpensesSummary();
  markAsModified();
  showNotification('New expense added', 'success');
}

function removeExpense(expenseId) {
  if (appState.company.expenses.length <= 1) {
    showNotification('Cannot remove the last expense item', 'error');
    return;
  }
  
  appState.company.expenses = appState.company.expenses.filter(e => e.id !== expenseId);
  renderExpensesList();
  renderExpensesSummary();
  markAsModified();
  showNotification('Expense removed', 'success');
}

function updateEditTotalBurn() {
  const total = calculateTotalBurn();
  const totalBurnEl = document.getElementById('edit-total-burn');
  if (totalBurnEl) {
    totalBurnEl.textContent = formatCurrency(total);
  }
}

// Form Validation
function setupFormValidation() {
  const inputs = [
    'edit-company-name',
    'edit-current-cash', 
    'edit-monthly-revenue',
    'edit-employees',
    'edit-product-price'
  ];
  
  inputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => {
        markAsModified();
        if (input.type === 'number') {
          validateNumberInput(input);
        }
      });
    }
  });
}

function validateNumberInput(input) {
  const value = parseFloat(input.value);
  const min = parseFloat(input.min) || 0;
  const max = parseFloat(input.max) || Infinity;
  
  if (isNaN(value) || value < min || value > max) {
    input.classList.add('error');
    input.classList.remove('success');
  } else {
    input.classList.remove('error');
    input.classList.add('success');
  }
}

// Import/Export Functions
function exportProfile() {
  const profileData = {
    company: appState.company,
    exported_at: new Date().toISOString(),
    version: "1.0"
  };
  
  const dataStr = JSON.stringify(profileData, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `${appState.company.name.replace(/\s+/g, '_')}_profile.json`;
  link.click();
  
  showNotification('Profile exported successfully', 'success');
}

function importProfile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const profileData = JSON.parse(e.target.result);
      
      if (profileData.company) {
        if (!confirm('This will replace your current profile. Continue?')) {
          return;
        }
        
        appState.company = {
          ...appState.company,
          ...profileData.company
        };
        
        // Ensure expenses have IDs
        appState.company.expenses = appState.company.expenses.map(expense => ({
          ...expense,
          id: expense.id || generateId()
        }));
        
        updateCompanyProfile();
        updateAllScenarios();
        renderExpensesSummary();
        
        if (appState.isEditMode) {
          populateEditForm();
          renderExpensesList();
        }
        
        showNotification('Profile imported successfully', 'success');
      } else {
        throw new Error('Invalid profile format');
      }
    } catch (error) {
      showNotification('Error importing profile: Invalid file format', 'error');
    }
  };
  
  reader.readAsText(file);
}

// Company Profile Updates
function updateCompanyProfile() {
  const company = appState.company;
  const totalBurn = calculateTotalBurn();
  const runway = calculateRunway();
  
  // Update display elements
  const elements = [
    ['company-name', company.name],
    ['current-cash', formatCurrency(company.current_cash)],
    ['monthly-burn', formatCurrency(totalBurn)],
    ['monthly-revenue', formatCurrency(company.monthly_revenue)],
    ['employees', company.employees],
    ['product-price', formatCurrency(company.product_price)],
    ['runway-months', `${runway.toFixed(1)} months`]
  ];
  
  elements.forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value;
    }
  });
  
  // Update runway color based on value
  const runwayEl = document.getElementById('runway-months');
  if (runwayEl) {
    if (runway < 3) {
      runwayEl.style.color = 'var(--color-error)';
    } else if (runway < 6) {
      runwayEl.style.color = 'var(--color-warning)';
    } else {
      runwayEl.style.color = 'var(--color-primary)';
    }
  }
  
  // Update expenses summary
  renderExpensesSummary();
}

function updateUsageStats() {
  const usage = appState.usage;
  const elements = [
    ['scenarios-count', usage.scenarios_tested],
    ['reports-count', usage.reports_generated], 
    ['session-cost', formatCurrency(usage.session_cost)]
  ];
  
  elements.forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value;
    }
  });
}

// Scenario slider setup and calculations
function setupScenarioSliders() {
  // Hiring scenario sliders
  const newHiresSlider = document.getElementById('new-hires');
  const costPerHireSlider = document.getElementById('cost-per-hire');
  
  if (newHiresSlider && costPerHireSlider) {
    ['input', 'change'].forEach(eventType => {
      newHiresSlider.addEventListener(eventType, updateHiringScenario);
      costPerHireSlider.addEventListener(eventType, updateHiringScenario);
    });
  }

  // Marketing scenario sliders
  const marketingSpendSlider = document.getElementById('marketing-spend');
  const roiMultiplierSlider = document.getElementById('roi-multiplier');
  
  if (marketingSpendSlider && roiMultiplierSlider) {
    ['input', 'change'].forEach(eventType => {
      marketingSpendSlider.addEventListener(eventType, updateMarketingScenario);
      roiMultiplierSlider.addEventListener(eventType, updateMarketingScenario);
    });
  }

  // Pricing scenario sliders
  const priceChangeSlider = document.getElementById('price-change');
  const demandElasticitySlider = document.getElementById('demand-elasticity');
  
  if (priceChangeSlider && demandElasticitySlider) {
    ['input', 'change'].forEach(eventType => {
      priceChangeSlider.addEventListener(eventType, updatePricingScenario);
      demandElasticitySlider.addEventListener(eventType, updatePricingScenario);
    });
  }
}

// Scenario Calculations and Updates
function updateHiringScenario() {
  const newHiresSlider = document.getElementById('new-hires');
  const costPerHireSlider = document.getElementById('cost-per-hire');
  
  if (!newHiresSlider || !costPerHireSlider) return;
  
  const newHires = parseInt(newHiresSlider.value);
  const costPerHire = parseInt(costPerHireSlider.value);
  
  // Update display values
  const newHiresValueEl = document.getElementById('new-hires-value');
  const costPerHireValueEl = document.getElementById('cost-per-hire-value');
  
  if (newHiresValueEl) newHiresValueEl.textContent = newHires;
  if (costPerHireValueEl) costPerHireValueEl.textContent = formatNumber(costPerHire);
  
  const currentBurn = calculateTotalBurn();
  const additionalCost = newHires * costPerHire;
  const newBurn = currentBurn + additionalCost;
  const newRunway = appState.company.current_cash / newBurn;
  
  appState.scenarios.hiring = {
    new_hires: newHires,
    cost_per_hire: costPerHire,
    current_burn: currentBurn,
    new_burn: newBurn,
    new_runway: newRunway
  };
  
  // Update UI elements
  const elements = [
    ['current-burn', formatCurrency(currentBurn) + '/mo'],
    ['new-burn', formatCurrency(newBurn) + '/mo'],
    ['new-runway', newRunway.toFixed(1) + ' months']
  ];
  
  elements.forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
  
  const summaryText = `Adding ${newHires} new hire${newHires !== 1 ? 's' : ''} at ${formatCurrency(costPerHire)} each will increase monthly burn to ${formatCurrency(newBurn)}, reducing runway from ${calculateRunway().toFixed(1)} to ${newRunway.toFixed(1)} months.`;
  const summaryEl = document.getElementById('hiring-summary');
  if (summaryEl) summaryEl.textContent = summaryText;
  
  updateHiringChart();
}

function updateMarketingScenario() {
  const marketingSpendSlider = document.getElementById('marketing-spend');
  const roiMultiplierSlider = document.getElementById('roi-multiplier');
  
  if (!marketingSpendSlider || !roiMultiplierSlider) return;
  
  const marketingSpend = parseInt(marketingSpendSlider.value);
  const roiMultiplier = parseFloat(roiMultiplierSlider.value);
  
  // Update display values
  const spendValueEl = document.getElementById('marketing-spend-value');
  const roiValueEl = document.getElementById('roi-multiplier-value');
  
  if (spendValueEl) spendValueEl.textContent = formatNumber(marketingSpend);
  if (roiValueEl) roiValueEl.textContent = roiMultiplier.toFixed(1) + 'x';
  
  const expectedReturn = marketingSpend * roiMultiplier;
  const netGain = expectedReturn - marketingSpend;
  
  appState.scenarios.marketing = {
    additional_spend: marketingSpend,
    roi_multiplier: roiMultiplier,
    expected_return: expectedReturn,
    net_gain: netGain
  };
  
  // Update UI elements
  const elements = [
    ['marketing-investment', formatCurrency(marketingSpend)],
    ['expected-return', formatCurrency(expectedReturn)],
    ['net-gain', formatCurrency(netGain)]
  ];
  
  elements.forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
  
  const summaryText = `Investing ${formatCurrency(marketingSpend)} in marketing with a ${roiMultiplier.toFixed(1)}x ROI will generate ${formatCurrency(expectedReturn)} return, resulting in ${formatCurrency(netGain)} net ${netGain >= 0 ? 'gain' : 'loss'}.`;
  const summaryEl = document.getElementById('marketing-summary');
  if (summaryEl) summaryEl.textContent = summaryText;
  
  updateMarketingChart();
}

function updatePricingScenario() {
  const priceChangeSlider = document.getElementById('price-change');
  const demandElasticitySlider = document.getElementById('demand-elasticity');
  
  if (!priceChangeSlider || !demandElasticitySlider) return;
  
  const priceChangePercent = parseInt(priceChangeSlider.value);
  const demandElasticity = parseFloat(demandElasticitySlider.value);
  
  // Update display values
  const priceChangeValueEl = document.getElementById('price-change-value');
  const elasticityValueEl = document.getElementById('demand-elasticity-value');
  
  if (priceChangeValueEl) priceChangeValueEl.textContent = (priceChangePercent >= 0 ? '+' : '') + priceChangePercent + '%';
  if (elasticityValueEl) elasticityValueEl.textContent = demandElasticity.toFixed(1);
  
  const currentPrice = appState.company.product_price;
  const newPrice = currentPrice * (1 + priceChangePercent / 100);
  const currentUnits = Math.round(appState.company.monthly_revenue / currentPrice);
  const demandChangePercent = demandElasticity * priceChangePercent;
  const newUnits = currentUnits * (1 + demandChangePercent / 100);
  
  const currentRevenue = currentPrice * currentUnits;
  const newRevenue = newPrice * newUnits;
  const profitImpactPercent = ((newRevenue - currentRevenue) / currentRevenue) * 100;
  
  appState.scenarios.pricing = {
    price_change_percent: priceChangePercent,
    demand_elasticity: demandElasticity,
    current_units: currentUnits,
    new_price: newPrice,
    sales_change: demandChangePercent,
    profit_impact: profitImpactPercent
  };
  
  // Update UI elements
  const elements = [
    ['new-price', formatCurrency(Math.round(newPrice))],
    ['sales-change', (demandChangePercent >= 0 ? '+' : '') + demandChangePercent.toFixed(1) + '%'],
    ['profit-impact', (profitImpactPercent >= 0 ? '+' : '') + profitImpactPercent.toFixed(1) + '%']
  ];
  
  elements.forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
  
  const summaryText = `${priceChangePercent >= 0 ? 'Increasing' : 'Decreasing'} price by ${Math.abs(priceChangePercent)}% to ${formatCurrency(Math.round(newPrice))} will ${demandChangePercent >= 0 ? 'increase' : 'reduce'} demand by ${Math.abs(demandChangePercent).toFixed(1)}% ${profitImpactPercent >= 0 ? 'and increase' : 'but decrease'} overall profit by ${Math.abs(profitImpactPercent).toFixed(1)}%.`;
  const summaryEl = document.getElementById('pricing-summary');
  if (summaryEl) summaryEl.textContent = summaryText;
  
  updatePricingChart();
}

function updateAllScenarios() {
  updateHiringScenario();
  updateMarketingScenario();
  updatePricingScenario();
}

// Chart Management
function initializeCharts() {
  initializeHiringChart();
  initializeMarketingChart();
  initializePricingChart();
}

function initializeHiringChart() {
  const ctx = document.getElementById('hiring-chart');
  if (!ctx) return;
  
  const context = ctx.getContext('2d');
  const currentBurn = calculateTotalBurn();
  const newBurn = currentBurn + (appState.scenarios.hiring.new_hires * appState.scenarios.hiring.cost_per_hire);
  
  appState.charts.hiring = new Chart(context, {
    type: 'bar',
    data: {
      labels: ['Current Burn', 'New Burn'],
      datasets: [{
        label: 'Monthly Burn Rate (₹)',
        data: [currentBurn, newBurn],
        backgroundColor: ['#1FB8CD', '#B4413C'],
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        }
      }
    }
  });
}

function initializeMarketingChart() {
  const ctx = document.getElementById('marketing-chart');
  if (!ctx) return;
  
  const context = ctx.getContext('2d');
  appState.charts.marketing = new Chart(context, {
    type: 'doughnut',
    data: {
      labels: ['Investment', 'Expected Return'],
      datasets: [{
        data: [10000, 15000],
        backgroundColor: ['#FFC185', '#1FB8CD'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function initializePricingChart() {
  const ctx = document.getElementById('pricing-chart');
  if (!ctx) return;
  
  const context = ctx.getContext('2d');
  const currentPrice = appState.company.product_price;
  const currentUnits = Math.round(appState.company.monthly_revenue / currentPrice);
  
  appState.charts.pricing = new Chart(context, {
    type: 'line',
    data: {
      labels: ['Current', 'Projected'],
      datasets: [{
        label: 'Price (₹)',
        data: [currentPrice, currentPrice * 1.1],
        borderColor: '#1FB8CD',
        backgroundColor: 'rgba(31, 184, 205, 0.1)',
        fill: true,
        tension: 0.4
      }, {
        label: 'Units Sold',
        data: [currentUnits, currentUnits * 0.95],
        borderColor: '#FFC185',
        backgroundColor: 'rgba(255, 193, 133, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Price (₹)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Units'
          },
          grid: {
            drawOnChartArea: false,
          },
        }
      }
    }
  });
}

function updateHiringChart() {
  if (appState.charts.hiring) {
    const currentBurn = calculateTotalBurn();
    const newBurn = currentBurn + (appState.scenarios.hiring.new_hires * appState.scenarios.hiring.cost_per_hire);
    appState.charts.hiring.data.datasets[0].data = [currentBurn, newBurn];
    appState.charts.hiring.update('none');
  }
}

function updateMarketingChart() {
  if (appState.charts.marketing) {
    const data = [appState.scenarios.marketing.additional_spend, appState.scenarios.marketing.expected_return];
    appState.charts.marketing.data.datasets[0].data = data;
    appState.charts.marketing.update('none');
  }
}

function updatePricingChart() {
  if (appState.charts.pricing) {
    const pricing = appState.scenarios.pricing;
    const currentPrice = appState.company.product_price;
    const currentUnits = Math.round(appState.company.monthly_revenue / currentPrice);
    const newUnits = currentUnits * (1 + pricing.sales_change / 100);
    
    appState.charts.pricing.data.datasets[0].data = [currentPrice, pricing.new_price];
    appState.charts.pricing.data.datasets[1].data = [currentUnits, newUnits];
    appState.charts.pricing.update('none');
  }
}

// Tab Management
function showScenario(scenarioType) {
  document.querySelectorAll('.tab-button').forEach(tab => {
    tab.classList.remove('active');
  });
  
  const activeTab = document.querySelector(`[data-scenario="${scenarioType}"]`);
  if (activeTab) activeTab.classList.add('active');

  document.querySelectorAll('.scenario-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  
  const activePanel = document.getElementById(`${scenarioType}-scenario`);
  if (activePanel) activePanel.classList.add('active');

  setTimeout(() => {
    if (appState.charts[scenarioType]) {
      appState.charts[scenarioType].resize();
    }
  }, 100);
}

// Usage Tracking
function incrementScenariosCount() {
  appState.usage.scenarios_tested++;
  appState.usage.session_cost += 5;
  updateUsageStats();
}

function incrementReportsCount() {
  appState.usage.reports_generated++;
  appState.usage.session_cost += 10;
  updateUsageStats();
}

// Report Generation
function generateReport(scenarioType) {
  incrementReportsCount();
  
  let reportContent = '';
  let reportTitle = '';
  
  switch(scenarioType) {
    case 'hiring':
      reportTitle = `Hiring Impact Analysis Report - ${appState.company.name}`;
      reportContent = generateHiringReport();
      break;
    case 'marketing':
      reportTitle = `Marketing Investment Report - ${appState.company.name}`;
      reportContent = generateMarketingReport();
      break;
    case 'pricing':
      reportTitle = `Price Adjustment Analysis Report - ${appState.company.name}`;
      reportContent = generatePricingReport();
      break;
  }
  
  const titleEl = document.getElementById('report-title');
  const contentEl = document.getElementById('report-content');
  const modalEl = document.getElementById('report-modal');
  
  if (titleEl) titleEl.textContent = reportTitle;
  if (contentEl) contentEl.innerHTML = reportContent;
  if (modalEl) modalEl.classList.remove('hidden');
}

function generateHiringReport() {
  const scenario = appState.scenarios.hiring;
  const company = appState.company;
  const currentBurn = calculateTotalBurn();
  const runway = calculateRunway();
  
  return `
    <div class="report-section">
      <h4>Executive Summary</h4>
      <p>Analysis of hiring ${scenario.new_hires} new employee${scenario.new_hires !== 1 ? 's' : ''} at ₹${formatNumber(scenario.cost_per_hire)} monthly cost per hire for ${company.name}.</p>
    </div>
    
    <div class="report-section">
      <h4>Current Company Profile</h4>
      <div class="report-metrics">
        <div class="report-metric">
          <span class="report-metric-label">Current Cash:</span>
          <span class="report-metric-value">${formatCurrency(company.current_cash)}</span>
        </div>
        <div class="report-metric">
          <span class="report-metric-label">Current Runway:</span>
          <span class="report-metric-value">${runway.toFixed(1)} months</span>
        </div>
        <div class="report-metric">
          <span class="report-metric-label">Current Team Size:</span>
          <span class="report-metric-value">${company.employees} employees</span>
        </div>
      </div>
    </div>
    
    <div class="report-section">
      <h4>Financial Impact</h4>
      <div class="report-metrics">
        <div class="report-metric">
          <span class="report-metric-label">Current Monthly Burn:</span>
          <span class="report-metric-value">${formatCurrency(currentBurn)}</span>
        </div>
        <div class="report-metric">
          <span class="report-metric-label">New Monthly Burn:</span>
          <span class="report-metric-value">${formatCurrency(scenario.new_burn)}</span>
        </div>
        <div class="report-metric">
          <span class="report-metric-label">Additional Cost:</span>
          <span class="report-metric-value">${formatCurrency(scenario.new_hires * scenario.cost_per_hire)}</span>
        </div>
        <div class="report-metric">
          <span class="report-metric-label">New Runway:</span>
          <span class="report-metric-value">${scenario.new_runway.toFixed(1)} months</span>
        </div>
      </div>
    </div>
    
    <div class="report-section">
      <h4>Recommendations</h4>
      <p>${scenario.new_runway < 6 ? 
        'Warning: Runway will be reduced to less than 6 months. Consider securing additional funding or reducing costs before proceeding with hiring.' :
        scenario.new_runway < 12 ? 
        'Caution: Runway will be reduced. Monitor cash flow closely and plan for fundraising within the next 6 months.' :
        'Hiring plan appears sustainable with current cash position. Consider the strategic value of new hires against runway reduction.'}</p>
    </div>
  `;
}

function generateMarketingReport() {
  const scenario = appState.scenarios.marketing;
  const company = appState.company;
  
  return `
    <div class="report-section">
      <h4>Executive Summary</h4>
      <p>Analysis of ₹${formatNumber(scenario.additional_spend)} marketing investment with expected ${scenario.roi_multiplier}x ROI multiplier for ${company.name}.</p>
    </div>
    
    <div class="report-section">
      <h4>Current Marketing Context</h4>
      <div class="report-metrics">
        <div class="report-metric">
          <span class="report-metric-label">Current Monthly Revenue:</span>
          <span class="report-metric-value">${formatCurrency(company.monthly_revenue)}</span>
        </div>
        <div class="report-metric">
          <span class="report-metric-label">Current Marketing Spend:</span>
          <span class="report-metric-value">${formatCurrency(company.expenses.find(e => e.name.toLowerCase().includes('marketing'))?.amount || 0)}</span>
        </div>
      </div>
    </div>
    
    <div class="report-section">
      <h4>Investment Analysis</h4>
      <div class="report-metrics">
        <div class="report-metric">
          <span class="report-metric-label">Marketing Investment:</span>
          <span class="report-metric-value">${formatCurrency(scenario.additional_spend)}</span>
        </div>
        <div class="report-metric">
          <span class="report-metric-label">Expected Return:</span>
          <span class="report-metric-value">${formatCurrency(scenario.expected_return)}</span>
        </div>
        <div class="report-metric">
          <span class="report-metric-label">Net Gain:</span>
          <span class="report-metric-value">${formatCurrency(scenario.net_gain)}</span>
        </div>
        <div class="report-metric">
          <span class="report-metric-label">ROI Percentage:</span>
          <span class="report-metric-value">${((scenario.roi_multiplier - 1) * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
    
    <div class="report-section">
      <h4>Recommendations</h4>
      <p>${scenario.net_gain > 0 ? 
        `Recommended: This marketing investment shows positive ROI and should generate ₹${formatCurrency(scenario.net_gain)} in net profit.` :
        'Not Recommended: This marketing investment may not generate sufficient returns to justify the spend. Consider revising the strategy or ROI expectations.'}</p>
    </div>
  `;
}

function generatePricingReport() {
  const scenario = appState.scenarios.pricing;
  const company = appState.company;
  
  return `
    <div class="report-section">
      <h4>Executive Summary</h4>
      <p>Analysis of ${scenario.price_change_percent >= 0 ? 'increasing' : 'decreasing'} product price by ${Math.abs(scenario.price_change_percent)}% with demand elasticity of ${scenario.demand_elasticity} for ${company.name}.</p>
    </div>
    
    <div class="report-section">
      <h4>Current Pricing Context</h4>
      <div class="report-metrics">
        <div class="report-metric">
          <span class="report-metric-label">Current Revenue:</span>
          <span class="report-metric-value">${formatCurrency(company.monthly_revenue)}</span>
        </div>
        <div class="report-metric">
          <span class="report-metric-label">Estimated Current Units:</span>
          <span class="report-metric-value">${Math.round(company.monthly_revenue / company.product_price)}</span>
        </div>
      </div>
    </div>
    
    <div class="report-section">
      <h4>Pricing Impact</h4>
      <div class="report-metrics">
        <div class="report-metric">
          <span class="report-metric-label">Current Price:</span>
          <span class="report-metric-value">${formatCurrency(company.product_price)}</span>
        </div>
        <div class="report-metric">
          <span class="report-metric-label">New Price:</span>
          <span class="report-metric-value">${formatCurrency(Math.round(scenario.new_price))}</span>
        </div>
        <div class="report-metric">
          <span class="report-metric-label">Sales Volume Change:</span>
          <span class="report-metric-value">${(scenario.sales_change >= 0 ? '+' : '')}${scenario.sales_change.toFixed(1)}%</span>
        </div>
        <div class="report-metric">
          <span class="report-metric-label">Profit Impact:</span>
          <span class="report-metric-value">${(scenario.profit_impact >= 0 ? '+' : '')}${scenario.profit_impact.toFixed(1)}%</span>
        </div>
      </div>
    </div>
    
    <div class="report-section">
      <h4>Recommendations</h4>
      <p>${scenario.profit_impact > 5 ? 
        'Recommended: Price change shows strong profit improvement. Monitor customer response and be prepared to adjust if demand drops more than expected.' :
        scenario.profit_impact > 0 ?
        'Consider: Moderate profit improvement expected. Test with a smaller customer segment first to validate demand response.' :
        'Caution: Price change may negatively impact overall profitability. Consider alternative strategies to improve revenue.'}</p>
    </div>
  `;
}

// Modal Management
function closeReport() {
  const modalEl = document.getElementById('report-modal');
  if (modalEl) modalEl.classList.add('hidden');
}

function exportReport() {
  const reportContent = document.getElementById('report-content')?.innerHTML || '';
  const reportTitle = document.getElementById('report-title')?.textContent || 'Report';
  
  const fullReport = `
    <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #218cd4; border-bottom: 2px solid #218cd4; padding-bottom: 10px; }
          h4 { color: #218cd4; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-top: 30px; }
          .report-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
          .report-metric { display: flex; justify-content: space-between; padding: 12px; background: #f9f9f9; border-radius: 8px; }
          .report-metric-label { font-weight: bold; }
          .report-section { margin-bottom: 30px; }
          p { margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>${reportTitle}</h1>
        <p><strong>Generated on:</strong> ${new Date().toLocaleString('en-IN')}</p>
        <p><strong>Company:</strong> ${appState.company.name}</p>
        ${reportContent}
        <hr style="margin-top: 40px;">
        <p style="font-size: 12px; color: #666;">Generated by CFO Helper Dynamic - Financial Scenario Planning Tool</p>
      </body>
    </html>
  `;
  
  const blob = new Blob([fullReport], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reportTitle.replace(/\s+/g, '_')}.html`;
  a.click();
  URL.revokeObjectURL(url);
  
  closeReport();
}

// Data Refresh
function refreshData() {
  const variations = {
    current_cash: (Math.random() - 0.5) * 50000,
    monthly_revenue: (Math.random() - 0.5) * 5000,
    product_price: (Math.random() - 0.5) * 10
  };
  
  appState.company.current_cash = Math.max(100000, appState.company.current_cash + variations.current_cash);
  appState.company.monthly_revenue = Math.max(10000, appState.company.monthly_revenue + variations.monthly_revenue);
  appState.company.product_price = Math.max(50, appState.company.product_price + variations.product_price);
  
  // Add small variations to expenses
  appState.company.expenses = appState.company.expenses.map(expense => ({
    ...expense,
    amount: Math.max(1000, expense.amount + (Math.random() - 0.5) * 2000)
  }));
  
  updateCompanyProfile();
  updateAllScenarios();
  updateLastUpdated();
  
  if (appState.isEditMode) {
    populateEditForm();
  }
  
  const button = document.getElementById('refresh-data');
  if (button) {
    const originalText = button.textContent;
    button.textContent = 'Refreshed!';
    button.classList.add('btn--success');
    
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('btn--success');
    }, 2000);
  }
  
  showNotification('Data refreshed with market variations', 'success');
}

function resetCounters() {
  appState.usage = {
    scenarios_tested: 0,
    reports_generated: 0,
    session_cost: 0
  };
  updateUsageStats();
  
  const button = document.getElementById('reset-counters');
  if (button) {
    const originalText = button.textContent;
    button.textContent = 'Reset!';
    
    setTimeout(() => {
      button.textContent = originalText;
    }, 1000);
  }
  
  showNotification('Usage counters reset', 'success');
}

// Handle modal backdrop clicks
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal')) {
    closeReport();
  }
});

// Prevent data loss on page unload
window.addEventListener('beforeunload', function(e) {
  if (appState.hasUnsavedChanges) {
    const confirmationMessage = 'You have unsaved changes. Are you sure you want to leave?';
    e.returnValue = confirmationMessage;
    return confirmationMessage;
  }
});