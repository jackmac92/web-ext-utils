import { browser } from "webextension-polyfill-ts";

let allPermissions: string[];
browser.permissions.getAll().then(allPerms => {
  allPermissions = allPerms.permissions || [];
});

/**
 * @hidden
 */
export default (...requiredPermissions: string[]) =>
  function(target: Function) {
    for (const propertyName of Object.keys(target.prototype)) {
      const descriptor = Object.getOwnPropertyDescriptor(
        target.prototype,
        propertyName
      );
      if (!descriptor) continue;
      const isMethod = descriptor.value instanceof Function;
      if (!isMethod) continue;

      const originalMethod = descriptor.value;
      descriptor.value = function(...args: any[]) {
        const missingRequiredPerms = requiredPermissions.filter(
          el => !allPermissions.includes(el)
        );
        if (missingRequiredPerms.length > 0) {
          throw new Error(
            `Missing required permissions to call ${propertyName}, requires permission for ${missingRequiredPerms.join(
              " "
            )}`
          );
        }
        return originalMethod.apply(this, args);
      };

      Object.defineProperty(target.prototype, propertyName, descriptor);
    }
  };
