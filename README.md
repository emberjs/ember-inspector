# Ember Extension

Ember Extension (Inspector) adds a new tab to your Chrome dev tools which allows you to leverage these powerful tools to get Ember specific insights into your app.

## Installation

Make sure your Chrome version is 25 or higher. Clone Ember Extension repo: `git clone https://github.com/tildeio/ember-extension`.

## Enable "Experimental Extensions APIs" in Chrome

Ember Extension uses [experimental APIs](http://developer.chrome.com/extensions/experimental.html) so you will need to enable them in your browser.
Visit [chrome://flags](chrome://flags), find "Experimental Extensions APIs" and enable them.

## Restart

After enabling "Experimental Extensions APIs", restart Chrome.

## Adding Ember Extension

Go to [chrome://extensions/](chrome://extensions/) and turn "Developer mode" on (checkbox on top, next to "Extensions").
Click on "Load unpacked extension" and navigate to your cloned Ember Extension repo.

## Test Run

Go to [Discourse](http://try.discourse.org) and open your Chrome dev tools. You should notice that there is a new `Ember` tab.
