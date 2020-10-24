FROM jkris/mountebank:latest

COPY . /MB

WORKDIR . /MB

EXPOSE 2525 4577 31102

CMD mb --configfile /Users/sinhap3/Stubs/MB/ConfigFiles/imposter-pnv.ejs --allowInjection
