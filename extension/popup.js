function normalizeUrl(url) {
  // Remove trailing slash after domain, convert to lowercase, remove www.
  try {
    let u = new URL(url);
    let norm = u.protocol + '//' + u.hostname.replace(/^www\./, '').toLowerCase();
    // Remove trailing slash if present and no path
    if (u.pathname === '/' || u.pathname === '') {
      return norm;
    } else {
      return norm + u.pathname.replace(/\/$/, '');
    }
  } catch (e) {
    return url.toLowerCase().replace(/\/$/, '').replace(/^www\./, '');
  }
}

function getDomain(url) {
  try {
    let u = new URL(url);
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch (e) {
    return url.toLowerCase().replace(/^www\./, '');
  }
}

// Import phishingList from external file
// Make sure to include phishingList.js in your popup.html before popup.js

function isSafeOrPhishing(url) {
  const domain = getDomain(url);
  console.log('Domain for lookup:', domain); // Debug log
  // If any phishingList entry is a substring of the domain, classify as PHISHING
  for (const badDomain of phishingList) {
    if (domain.includes(badDomain)) {
      return 'PHISHING';
    }
  }
  return 'SAFE'; // Default to SAFE for all other sites
}

function transfer() {
  var tablink;
  chrome.tabs.getSelected(null, function (tab) {
    const original_url = tab.url;
    tablink = tab.url;
    if (tablink.length > 30) {
      tablink = tablink.slice(0, 30) + ' ...';
    }
    $('#site').text(tablink);

    // Check whitelist/blacklist first
    const knownStatus = isSafeOrPhishing(original_url);
    if (knownStatus) {
      if (knownStatus === 'SAFE') {
        $('#div1').text('SAFE');
        $('#div2').text('');
      } else {
        $('#div2').text('PHISHING');
        $('#div1').text('');
      }
      return;
    }

    var xhr = new XMLHttpRequest();
    params = 'url=' + original_url;
    var markup =
      'url=' + original_url + '&html=' + document.documentElement.innerHTML;
    xhr.open('POST', 'http://localhost:8000', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onload = () => {
      if (xhr.responseText === 'SAFE') {
        $('#div1').text(xhr.responseText);
        $('#div2').text('');
      } else {
        $('#div2').text('PHISHING');
        $('#div1').text('');
      }
      return xhr.responseText;
    };
    xhr.send(markup);
  });
}

$(document).ready(function () {
  $('button').click(function () {
    var val = transfer();
  });
});

chrome.tabs.getSelected(null, function (tab) {
  var tablink = tab.url;
  if (tablink.length > 30) {
    tablink = tablink.slice(0, 30) + ' ....';
  }
  $('#site').text(tablink + '\n\n');
});
