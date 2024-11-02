document.getElementById('request-all').addEventListener('click', async () =>  {
  await chrome.permissions.request({origins: ['<all_urls>']});
  window.close()
})

const url = new URL(window.location);
const tabOrigin = url.searchParams.get('tabOrigin');
document.getElementById('request-one').innerText += ' ' + tabOrigin;

document.getElementById('request-one').addEventListener('click', async () =>  {
  await chrome.permissions.request({origins: [tabOrigin + '/*']});
  window.close()
})
