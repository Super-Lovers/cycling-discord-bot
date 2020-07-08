<p align="center">
  <a href="" rel="noopener">
 <img width=200px height=200px src="header.png" alt="Bot logo"></a>
</p>

<h3 align="center">Cycling Discord Bot</h3>

## 📝 Table of Contents

* [About](#about)
* [Getting Started](#getting-started)
* [Usage](#usage)
	* [Adding a session](#adding-session)
	* [Deleting a session](#deleting-session)
	* [Browsing sessions](#browsing-sessions)
	* [Modifying session properties](#modifying-session)
* [Authors](#authors)
* [Contribution](#contribution)



## 🧐 About <a name = "about"></a>

This cycling discord bot can be used to log information about your cycling activity. You can use it for different activities as well, but for fun, we wanted to make it in the theme of cycling. The bot can also help you calculate averages of speed or find about how much you cycled. This list can be extended easily with more ideas. 



## 🏁 Getting Started <a name = "getting-started"></a>
Once the bot is activated in your server, you will receive the following message:
![Screenshot_1.png](Screenshot_1.png)

The next step before adding any of your sessions, you must set your preferred unit system. You can pick either imperial or metric using the following command:
![Screenshot_1.png](Screenshot_4.png)
In case you forget it, you can do ``$getUnitSystem`` to see it again.

Then, you can start using the bot's main commands. To learn how to use them, type ``$help`` in the chat to find out and the bot will reply back to you with this:
![Screenshot_2.png](Screenshot_2.png)

## 🎈 Usage <a name = "usage"></a>
### Adding a session <a name = "adding-session"></a>
The key use for the bot is to log each cycling activity to it with details about the activity itself, such as calories and distance covered. To add a session, you can use the following example command:
![Screenshot_3.png](Screenshot_3.png)

### Deleting a session <a name = "deleting-session"></a>
If you wish to delete a session, you can simply use the ``$deleteSession`` command with the session name as an argument.
![Screenshot_5.png](Screenshot_5.png)

### Browsing sessions <a name = "browsing-sessions"></a>
To look at multiple sessions, you use the ``$getSession`` command followed by the day, month and year of the sessions and then browse between pages using ``$page`` followed by the page number:
![Screenshot_6.png](Screenshot_6.png)
![Screenshot_7.png](Screenshot_7.png)
When you're done browsing, simply write ``$exit`` to stop, so that you can execute normal commands.

### Modifying session properties <a name = "modifying-session"></a>
Lastly, if you made a mistake when inputting your session properties, you can use the  ``$modify`` commands for correcting that mistake:
![Screenshot_7.png](Screenshot_8.png)


## ✍️ Authors <a name = "authors"></a>
* [Nikolay Ivanov (Super-Lovers)](https://github.com/Super-Lovers) - Developer
* [kriss9805](https://github.com/kriss9805) - Idea & Assistant

## 🎁 Contribution <a name = "contribution"></a>
If you want to extend the functionality of the bot, please don't hesitate to send me changes to approve.