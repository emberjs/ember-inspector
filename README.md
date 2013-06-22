## Intro

At [Ember Camp 2013](http://www.embercamp.com/) Yehuda Katz 
gave a brief introduction to the [Ember Inspector](https://github.com/tildeio/ember-extension). 

The Ember Inspector adds an `Ember` tab to your Chrome dev tools which
allows you to leverage these powerful tools to get Ember specific insights into
your app.

Like many things in the [Ember.js](http://emberjs.com/) world the Ember Inspector is relatively new. As such
it's not even available to download as a proper Chrome extension yet. For now
you'll need to load the Chrome extension from your local machine.

## Grab a copy

First make sure you have **Chrome 25 or higher**. That's currently the [Beta
build](https://www.google.com/intl/en/chrome/browser/beta.html) but after the
next release that will be the main build.

Second clone the Ember Inspector git repo.

    git clone https://github.com/tildeio/ember-extension

## Enable 'Experimental Extensions APIs'

This [Chrome](https://www.google.com/intl/en/chrome/browser/) extension uses
[experimental APIs](http://developer.chrome.com/extensions/experimental.html) so
you'll need to enable 'Experimental Extension APIs' by visiting [chrome://flags](chrome://flags).

> Experimental Extension APIs Mac, Windows, Linux, Chrome OS
> Enables experimental extension APIs. 

> Note that the extension gallery doesn't
> allow you to upload extensions that use experimental APIs.

> [Enable]()

Click the [Enable]() clink to 'Experimental Extension APIs'

## Restart

Often after toggling a setting in `chrome://flags/` Chrome will prompt you 
`Your changes will take effect the next time you relaunch Google Chrome.` which
is the case this time. 

Restart your browser by clicking the 'Relaunch now' button or manually quitting
and relaunching the browser.

## Load the Ember Inspector extension

From Chrome's `Window` drop down menu choose `Extension`

Now click the `Load unpacked extension...` button and navigate to where you
cloned the ember-extension repo and click `Select`.

## Give it a test run

Ok you've got it installed! Congrats! Now let's see what this thing can do.

Point your browser at [http://try.discourse.org/](http://try.discourse.org/) and
fire up your Chrome dev tools. You should notice that there is a new `Ember`
tab. Click on it and you'll get something similar to 

    application
      header
      list/list
        list/topics
      modalController

If you hover over one of these such as `list/topics` you'll see the template,
controller, and model. In this case:

    template=list/topics
    controller=listTopicsController
    model=<Discourse.TopicList:ember687>

## More resources

[Yehuda Katz](http://twitter.com/wycats) has several video on the Ember
Inspector [on YouTube](http://www.youtube.com/user/wycats/videos)
