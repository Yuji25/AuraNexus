export const logInfo = (msg, data = {}) => {
  console.log(`ℹ️  INFO: ${msg}`, data);
};

export const logSuccess = (msg, data = {}) => {
  console.log(`✅ SUCCESS: ${msg}`, data);
};

export const logWarning = (msg, data = {}) => {
  console.warn(`⚠️ WARNING: ${msg}`, data);
};

export const logError = (msg, data = {}) => {
  console.error(`❌ ERROR: ${msg}`, data);
};
