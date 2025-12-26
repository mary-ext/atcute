{
	"targets": [
		{
			"target_name": "time_ms",
			"sources": ["src/time_ms.c"],
			"cflags": ["-Wall", "-Wextra", "-O3"],
			"xcode_settings": {
				"OTHER_CFLAGS": ["-Wall", "-Wextra", "-O3"]
			},
			"msvs_settings": {
				"VCCLCompilerTool": {
					"Optimization": 2,
					"WarnAsError": "false"
				}
			}
		}
	]
}
