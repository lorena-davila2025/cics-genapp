# =============================================================
#  Stage 1 — Compile COBOL on Ubuntu 22.04 LTS
#  Build context must be the repo root so both base/src and
#  local-build/ are available to COPY.
# =============================================================
FROM ubuntu:22.04 AS cobol-builder
ARG DEBIAN_FRONTEND=noninteractive

# Install GnuCOBOL, PostgreSQL dev headers, build tools, and Python 3
# (patch_cics.py is a Python script used by the Makefile)
RUN apt-get update && apt-get install -y --no-install-recommends \
      gnucobol \
      libpq-dev \
      build-essential \
      git \
      python3 \
      pkg-config \
      automake \
      autoconf \
      libtool \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Build ocesql (open-cobol-ESQL) from source — no apt package available.
# It is the ESQL preprocessor that converts EXEC SQL ... END-EXEC blocks
# into plain GnuCOBOL dynamic SQL calls.
WORKDIR /build/ocesql
RUN git clone --depth 1 https://github.com/opensourcecobol/open-cobol-ESQL . \
    && ./configure \
    && make -j"$(nproc)" \
    && make install \
    && ldconfig

# Copy the full source tree (build context = repo root).
# The Makefile references ../base/src (original COBOL) from local-build/,
# so both directories must be present at the same relative level.
WORKDIR /build/genapp
COPY base/src                  base/src
COPY local-build/Makefile      local-build/Makefile
COPY local-build/cics          local-build/cics
COPY local-build/cobol         local-build/cobol
COPY local-build/copybook      local-build/copybook
COPY local-build/scripts       local-build/scripts
COPY local-build/api/cobol     local-build/api/cobol

WORKDIR /build/genapp/local-build

# Run the Makefile, overriding the macOS/Homebrew paths it hard-codes
# with the correct Ubuntu 22.04 apt-installed paths.
RUN make all \
      COBC=/usr/bin/cobc \
      OCESQL=/usr/local/bin/ocesql \
      PG_LIBDIR=/usr/lib/x86_64-linux-gnu \
      PG_INCDIR=/usr/include/postgresql \
      OCE_LIBDIR=/usr/local/lib \
      OCE_INCDIR=/usr/local/include \
  && make api-runners \
      COBC=/usr/bin/cobc \
      OCESQL=/usr/local/bin/ocesql \
      PG_LIBDIR=/usr/lib/x86_64-linux-gnu \
      PG_INCDIR=/usr/include/postgresql \
      OCE_LIBDIR=/usr/local/lib \
      OCE_INCDIR=/usr/local/include

# The Makefile targets *.dylib (macOS naming) but on Linux cobc honours
# the -o flag verbatim, so files are genuinely named *.dylib with ELF
# content. Add *.so symlinks as a safety net for GnuCOBOL's module loader.
RUN cd bin && for f in *.dylib; do ln -sf "$f" "${f%.dylib}.so"; done

# =============================================================
#  Stage 2 — Node 22 runtime
# =============================================================
FROM node:22-bookworm-slim AS runtime
ARG DEBIAN_FRONTEND=noninteractive

# GnuCOBOL runtime libraries + libpq (needed by ocesql at runtime)
RUN apt-get update && apt-get install -y --no-install-recommends \
      gnucobol \
      libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy the ocesql shared library from the builder stage
COPY --from=cobol-builder /usr/local/lib/libocesql.so* /usr/local/lib/
RUN ldconfig

# Copy compiled COBOL binaries and shared modules.
# cobolRunner.js resolves BIN_DIR as path.join(__dirname, '../../bin'),
# which from /app/api/utils/ resolves to /app/bin — must match this layout.
WORKDIR /app
COPY --from=cobol-builder /build/genapp/local-build/bin ./bin

# Install Node API dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY local-build/api/package.json   ./api/package.json
COPY local-build/api/pnpm-lock.yaml ./api/pnpm-lock.yaml
WORKDIR /app/api
RUN pnpm install --frozen-lockfile --prod

# Copy API source files
COPY local-build/api/server.js ./server.js
COPY local-build/api/routes    ./routes
COPY local-build/api/utils     ./utils

ENV NODE_ENV=production \
    PORT=3002 \
    COB_LIBRARY_PATH=/app/bin \
    COB_DYNAMIC_CALLS=YES

EXPOSE 3002

HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=5 \
  CMD node -e "require('http').get('http://localhost:3002/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
