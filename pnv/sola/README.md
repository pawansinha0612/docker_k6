# K6_PnV_Scripts:
Contains BFF endpoints for K6, created to performance test the apply BFF services as part of the CICD Pipeline.

# Instructions for using the framework ->
# Framework understanding - https://confluence.service.anz/display/DSSO/K6+Framework+-+Service+Level+Scripts
# Conventions - https://confluence.service.anz/display/DSSO/K6+Guidelines

    1. Do not modify the below files:
        .\api\jwt.js
        .\api\util.js
    2. Modify the below file with the OSE / GCP BaseURL for the service:
        .\config\env.json
    3. Run the scripts with the below command (for local testing)
        k6 run -e ENVIRONMENT=local -c config.json pnv.js
		-------Expected Output--------

          /\      |‾‾|  /‾‾/  /‾/
     /\  /  \     |  |_/  /  / /
    /  \/    \    |      |  /  ‾‾\
   /          \   |  |‾\  \ | (_) |
  / __________ \  |__|  \__\ \___/ .io

  execution: local
     output: -
     script: pnv.js

    █ 01_getJWT

      ✓ status was 200
      ✓ transaction time OK
      ✓ content OK for 01_getJWT
