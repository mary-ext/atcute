module.exports = {
	hooks: {
		readPackage(pkg) {
			if (pkg.name === '@atproto/pds') {
				delete pkg.dependencies['better-sqlite3'];
			}
			return pkg;
		},
	},
};
