CURL=curl -s -S

DEPENDENCIES=bing-layer.js\
						 leaflet\
						 add-to-homescreen\
						 require.js\
						 klass.js\
						 mocha\
						 chai

all: $(DEPENDENCIES)

clean:
	rm -rf $(DEPENDENCIES)

# zip file hosted somewhere on the internetz

leaflet:
	$(CURL) http://leaflet-cdn.s3.amazonaws.com/build/leaflet-0.7.zip -o $@.download.zip
	unzip -q $@.download.zip -d leaflet
	rm $@.download.zip

# single github file without tag

klass.js:
	$(CURL) -o $@ https://raw.github.com/ded/klass/c33b3c8114e4243c63619772b156f480d0d8af28/klass.js

bing-layer.js:
	$(CURL) -o $@ https://raw.github.com/shramov/leaflet-plugins/44935a984e2b051131a21f23d45c373ab8362564/layer/tile/Bing.js

# single github file, tagged

require.js:
	$(CURL) -o $@ https://raw.github.com/jrburke/requirejs/2.1.9/require.js

# GitHub releases

add-to-homescreen:
	mkdir -p $@
	$(CURL) https://codeload.github.com/cubiq/add-to-homescreen/tar.gz/2.0.11|tar xf - --strip-components 1 -C $@

mocha:
	mkdir -p $@
	$(CURL) https://codeload.github.com/visionmedia/mocha/tar.gz/1.14.0|tar xf - --strip-components 1 -C $@

chai:
	mkdir -p $@
	$(CURL) https://codeload.github.com/chaijs/chai/tar.gz/1.8.1|tar xf - --strip-components 1 -C $@