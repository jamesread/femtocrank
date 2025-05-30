/**
 * 0: Sidebar is default
 */
function clickSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const stickIcon = document.getElementById('stick-icon');
  const toggleButton = document.getElementById('sidebar-button');

  if (sidebar.classList.contains('shown')) {
    sidebar.classList.remove('shown');
    stickIcon.classList.add('vh')
    toggleButton.style.position = '';
  } else {
    sidebar.classList.add('shown');
    stickIcon.classList.remove('vh')
    toggleButton.style.position = 'fixed';
  }
}

function clickSidebarStick() {
  const sidebar = document.getElementById('sidebar');
  const toggleButton = document.getElementById('sidebar-button');

  if (sidebar.classList.contains('stuck')) {
    sidebar.classList.remove('stuck');
    toggleButton.style.position = 'fixed';
  } else {
    sidebar.classList.add('stuck');
    toggleButton.style.position = '';
  }

  console.log('Sidebar stick toggled');
}
