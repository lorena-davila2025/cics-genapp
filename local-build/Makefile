# ============================================================
#  GenApp local build — GnuCOBOL + ocesql + PostgreSQL
# ============================================================

COBC       = /opt/homebrew/bin/cobc
OCESQL     = /usr/local/bin/ocesql
PATCH      = python3 scripts/patch_cics.py

SRC_ORIG   = ../base/src
CPY        = copybook
CICS       = cics
GEN        = gen
BIN        = bin

PG_LIBDIR  = /opt/homebrew/lib/postgresql@18
PG_INCDIR  = /opt/homebrew/opt/postgresql@18/include/postgresql
OCE_LIBDIR = /usr/local/lib
OCE_INCDIR = /usr/local/include

COBFLAGS   = -m -std=ibm -fimplicit-init \
             -I $(CPY) \
             -I $(PG_INCDIR) \
             -I $(OCE_INCDIR) \
             -L $(PG_LIBDIR) \
             -L $(OCE_LIBDIR) \
             -lpq -locesql

# DB-layer programs (compilation order matters: lgacdb02 before lgacdb01)
DB_PROGS = lgacdb02 lgacdb01 lgicdb01 lgucdb01 lgdpdb01 lgapdb01 lgipdb01 lgupdb01 \
           lgdcdb01 lgaclm01 lgdclm01 lgicm01

# CICS stub programs
STUBS = LGSTSQ-STUB LGACVS01-STUB LGAPVS01-STUB \
        LGUPVS01-STUB LGUCVS01-STUB LGDPVS01-STUB

# ============================================================
.PHONY: all stubs db-progs clean dirs

all: dirs stubs db-progs

dirs:
	@mkdir -p $(GEN) $(BIN) src

# ============================================================
#  STUBS
# ============================================================
stubs: $(addprefix $(BIN)/, $(addsuffix .dylib, $(STUBS)))

$(BIN)/%.dylib: $(CICS)/%.cbl
	$(COBC) -m -std=ibm -fimplicit-init -o $@ $<

# ============================================================
#  DB PROGRAMS: patch -> ocesql -> cobc
# ============================================================
db-progs: $(addprefix $(BIN)/, $(addsuffix .dylib, $(DB_PROGS)))

# Step 1a: patch CICS constructs out of original source
src/%.cbl: $(SRC_ORIG)/%.cbl
	$(PATCH) $< $@

# Step 1b: lowercase filenames too (source files may be upper or lower case)
src/%.cbl: $(SRC_ORIG)/$(shell echo % | tr A-Z a-z).cbl
	$(PATCH) $< $@

# Step 1c: local new programs (no original source, no patching needed)
src/%.cbl: cobol/%.cbl
	cp $< $@

# Step 2: ocesql preprocessing
$(GEN)/%.cbl: src/%.cbl
	$(OCESQL) --inc=$(CPY) $< $@

# Step 3: compile with GnuCOBOL
$(BIN)/%.dylib: $(GEN)/%.cbl
	$(COBC) $(COBFLAGS) -o $@ $<

# ============================================================
#  API RUNNERS: compile COBOL runner executables for Node.js API
# ============================================================
API_RUNNERS = run_cust_inq run_cust_add run_cust_upd run_cust_del \
              run_pol_inq run_pol_add run_pol_del \
              run_clm_inq run_clm_add run_clm_del

API_RUNFLAGS = -x -std=ibm -fimplicit-init \
               -I $(CPY) \
               -I $(PG_INCDIR) \
               -I $(OCE_INCDIR) \
               -L $(PG_LIBDIR) \
               -L $(OCE_LIBDIR) \
               -lpq -locesql

.PHONY: api-runners
api-runners: dirs $(addprefix $(BIN)/, $(API_RUNNERS))

$(BIN)/run_%: api/cobol/run_%.cbl
	$(COBC) $(API_RUNFLAGS) -o $@ $<

# ============================================================
clean:
	rm -rf src gen bin
