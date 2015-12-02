/*
Copyright 2015 OpenMarket Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
var React = require('react');
var sdk = require('../../index');
var MatrixClientPeg = require("../../MatrixClientPeg");
var Modal = require('../../Modal');
var q = require('q');
var version = require('../../../package.json').version;

module.exports = React.createClass({
    displayName: 'UserSettings',
    Phases: {
        Loading: "loading",
        Display: "display",
    },

    getInitialState: function() {
        return {
            avatarUrl: null,
            threePids: [],
            clientVersion: version,
            phase: this.Phases.Loading,
        };
    },

    componentWillMount: function() {
        var self = this;
        var cli = MatrixClientPeg.get();

        var profile_d = cli.getProfileInfo(cli.credentials.userId);
        var threepid_d = cli.getThreePids();

        q.all([profile_d, threepid_d]).then(
            function(resps) {
                self.setState({
                    avatarUrl: resps[0].avatar_url,
                    threepids: resps[1].threepids,
                    phase: self.Phases.Display,
                });
            },
            function(err) { console.err(err); }
        );
    },

    editAvatar: function() {
        var url = MatrixClientPeg.get().mxcUrlToHttp(this.state.avatarUrl);
        var ChangeAvatar = sdk.getComponent('settings.ChangeAvatar');
        var avatarDialog = (
            <div>
                <ChangeAvatar initialAvatarUrl={url} />
                <div className="mx_Dialog_buttons">
                    <button onClick={this.onAvatarDialogCancel}>Cancel</button>
                </div>
            </div>
        );
        this.avatarDialog = Modal.createDialogWithElement(avatarDialog);
    },

    addEmail: function() {

    },

    editDisplayName: function() {
        this.refs.displayname.edit();
    },

    changePassword: function() {
        var ChangePassword = sdk.getComponent('settings.ChangePassword');
        Modal.createDialog(ChangePassword);
    },

    onLogoutClicked: function(ev) {
        var LogoutPrompt = sdk.getComponent('dialogs.LogoutPrompt');
        this.logoutModal = Modal.createDialog(LogoutPrompt, {onCancel: this.onLogoutPromptCancel});
    },

    onLogoutPromptCancel: function() {
        this.logoutModal.closeDialog();
    },

    onAvatarDialogCancel: function() {
        this.avatarDialog.close();
    },

    render: function() {
        var Loader = sdk.getComponent("elements.Spinner");
        if (this.state.phase === this.Phases.Loading) {
            return <Loader />
        }
        else if (this.state.phase === this.Phases.Display) {
            var ChangeDisplayName = sdk.getComponent('settings.ChangeDisplayName');
            var EnableNotificationsButton = sdk.getComponent('settings.EnableNotificationsButton');
            return (
            <div className="mx_UserSettings">
                <div className="mx_UserSettings_User">
                    <h1>User Settings</h1>
                    <hr/>
                    <div className="mx_UserSettings_User_Inner">
                        <div className="mx_UserSettings_Avatar">
                            <div className="mx_UserSettings_Avatar_Text">
                                Profile Photo
                            </div>
                            <div className="mx_UserSettings_Avatar_Edit" onClick={this.editAvatar}>
                                Edit
                            </div>
                        </div>

                        <div className="mx_UserSettings_DisplayName">
                            <ChangeDisplayName ref="displayname" />
                            <div className="mx_UserSettings_DisplayName_Edit" onClick={this.editDisplayName}>
                                Edit
                            </div>
                        </div>

                        <div className="mx_UserSettings_3pids">
                            {this.state.threepids.map(function(val) {
                                return <div key={val.address}>{val.address}</div>;
                            })}
                        </div>

                        <div className="mx_UserSettings_Add3pid" onClick={this.addEmail}>
                            Add email
                        </div>
                    </div>
                </div>

                <div className="mx_UserSettings_Global">
                    <h1>Global Settings</h1>
                    <hr/>
                    <div className="mx_UserSettings_Global_Inner">
                        <div className="mx_UserSettings_ChangePassword" onClick={this.changePassword}>
                            Change Password
                        </div>
                        <div className="mx_UserSettings_ClientVersion">
                            Version {this.state.clientVersion}
                        </div>
                        <div className="mx_UserSettings_EnableNotifications">
                            <EnableNotificationsButton />
                        </div>
                        <div className="mx_UserSettings_Logout">
                            <button onClick={this.onLogoutClicked}>Sign Out</button>
                        </div>
                    </div>
                </div>
            </div>
            );
        }
    }
});