import app from 'flarum/admin/app';

app.initializers.add('justoverclock/check-duplicate-discussions', () => {
  app.extensionData.for('justoverclock-check-duplicate-discussions').registerSetting({
    setting: 'justoverclock-check-duplicate-discussions.similarNumber',
    name: 'justoverclock-check-duplicate-discussions.similarNumber',
    type: 'number',
    label: app.translator.trans('justoverclock-check-duplicate-discussions.admin.similarNumber'),
    help: app.translator.trans('justoverclock-check-duplicate-discussions.admin.similarNumber-help'),
  });
});
