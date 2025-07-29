export default function sendApps(adapter, apps) {
  const serializedApps = apps.map((app) => {
    return {
      applicationName: app.applicationName,
      applicationId: app.applicationId,
    };
  });

  adapter.sendMessage({
    type: 'apps-loaded',
    apps: serializedApps,
    from: 'inspectedWindow',
  });
}
