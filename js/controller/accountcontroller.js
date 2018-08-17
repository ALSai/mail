/* global Promise */

/**
 * Mail
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Christoph Wurst <christoph@winzerhof-wurst.at>
 * @copyright Christoph Wurst 2016, 2017
 */

define(function(require) {
	'use strict';

	var CrashReport = require('crashreport');
	var AccountService = require('../service/accountservice');
	var FolderController = require('controller/foldercontroller');
	var Radio = require('radio');

	/**
	 * Load all accounts
	 *
	 * @returns {Promise}
	 */
	function loadAccounts() {
		// Do not show sidebar content until everything has been loaded
		Radio.ui.trigger('sidebar:loading');

		return AccountService.getAccountEntities().then((accounts) => {
			if (accounts.length === 0) {
				Radio.navigation.trigger('setup');
				Radio.ui.trigger('sidebar:accounts');
				return Promise.resolve(accounts);
			}

			return Promise.all(accounts.map((account) => {
				return FolderController.loadAccountFolders(account);
			})).then(() => {
				return accounts;
			});
		}).then((accounts) => {
			// Show accounts regardless of the result of
			// loading the folders
			Radio.ui.trigger('sidebar:accounts');

			return accounts;
		}, (e) => {
			console.error(e);
			CrashReport.report(e);
			Radio.ui.trigger('error:show', t('mail', 'Error while loading the accounts.'));
		});
	}

	return {
		loadAccounts: loadAccounts
	};
});
