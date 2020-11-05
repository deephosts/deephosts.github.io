Vue.config.devtools = true;

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

class dwVueProductModal {
    constructor(){
        this.el = '#mproduct';
        this.delimiters = ['##', '##'];
        this.data = {
            products: products_pipe,
            cycles: cycles_pipe,
            forcecycle: forcecycle_pipe,
            currencyCode: currency_pipe,
            modalContent: modalcontent_pipe,
            tlds: tlds_pipe,
            lang: smarty_lang,

            // Data needed for filtering Windows and Linux VPS Patch
            osTemplateWindows: [],

            a:"add",
            skipconfig:1,
            direct:true,

            selections:[],
            activeProductIndex:0,

            isCheckingDomain:false,
            isAddingToCart:false,
            isNone: true
        };
        this.filters = {
            toCurrency(str, prefix, suffix){
                if (!str) return '';
                    str = str.toLocaleString('id-ID');
                    return prefix+str+suffix;
            },
            addPlusSign(str){
                if (str == '') return '';
                    return "+ "+str;
            },
            addSetupFee(str){
                if (str == '') return '';
                    return str+" Setup Fee";
            },
            isRequired(str, required){
                if(required) {
                    return str + '*'
                }
                return str
            }
        };
        this.methods = {
              changeModal(idx) {
                  this.activeProductIndex = idx;
                  if(this.products[idx].domainconfig.showdomainoptions != "0") {
                        this.resetDomainCheckResult()
                        this.activeSelections.sld=""
                        this.activeSelections.tld=".com"
                        this.activeSelections.domainoption="register"
                        this.activeSelections.showdomainoptions = "1"
                  }
              },
              changeBillingCycle(cycle) {
                  if(this.activeSelections.showdomainoptions == '1') {
                      this.activeSelections.domainsregperiod[0]="1#off"
                  }
                  this.activeSelections.billingcycle = cycle
              },
              changeOption(event){
                  this.isNone = event.target.value == "None" ? true : false;
              },
              hasFreeDomain(cycle,product) {
                    if (!cycle) return '';
                    if(product.domainconfig.freedomainpaymentterms.indexOf(cycle) >= 0) {
                        return true;
                    }
                    return false;
              },
              hasFreeDomainOption(cycle, activeProductIndex){
                   if(this.products[activeProductIndex].domainconfig.freedomainpaymentterms.indexOf(cycle) >= 0){
                      return true;
                   }
                   return false;
              },
              isHidden(opt) {
                  if(opt.hasOwnProperty("hidden")) {
                      return true;
                  }
                  return false;
              },
              isTLDFree(tld) {
                  var selectedCycle = this.activeSelections.billingcycle
                  if(this.activeProduct.freeterms.indexOf(selectedCycle) >= 0 && this.activeProduct.freetlds.indexOf(tld) >= 0) {
                      return true
                  }
                  return false
              },
              checkDomain() {
                  this.resetDomainCheckResult()
                  var sld = this.activeSelections.sld
                  var tld = this.activeSelections.tld
                  var domainoption = this.activeSelections.domainoption

                      if(sld && tld && domainoption) {
                        var encodedParams = $.param(
                               {
                                  pid:this.activeProduct.pid,
                                  sld:sld,
                                  tld:tld,
                                  billingcycle:this.activeSelections.billingcycle,
                                  domainoption:domainoption,
                               }
                        )
                        var domain = sld+tld
                        this.isCheckingDomain = true
                        axios.post('/ajax/pub/searchDomain',encodedParams)
                            .then((response) => {

                              this.activeSelections.domainCheckResult = response.data
                              this.activeSelections.domains[0] = response.data[0].domain
                              this.activeSelections.domainsregperiod[0] = "1#off"
                              this.isCheckingDomain = false
                            })
                  } else {
                    alert("Please fill your desired domain");
                }

              },
              resetDomainCheckResult() {
                  this.activeSelections.domainCheckResult = []
                  this.activeSelections.domains = []
                  this.activeSelections.domainsregperiod = []
              },
              dwsprintf(source,str) {
                  var result = source.replace("%s",str)
                  return result
              },
              validateForm() {
                  var invalids = []
                  // Domain Validation
                  if(this.activeProduct.showdomain != '0') {
                      if(!this.activeSelections.sld || !this.activeSelections.tld) {
                          invalids.push("Mohon masukkan Domain yang Anda inginkan secara lengkap")
                          return invalids;
                      }
                      else if(this.activeSelections.domainoption != 'owndomain') {
                          if(this.activeSelections.domains.length <= 0) {
                              invalids.push("Mohon 'Cek Domain' Anda terlebih dahulu")
                              return invalids;
                          }
                          else if(this.domainSearchVar != this.activeSelections.domainCheckResult[0].status){
                             invalids.push("Mohon mengganti Domain yang Anda inginkan karena tidak valid")
                             return invalids;
                          }
                      }

                      // Premium Domain
                      if(this.activeSelections.domainCheckResult.length > 0) {
                          if(this.activeSelections.domainCheckResult[0].premium) {
                              invalids.push("Mohon mengirimkan tiket support karena Domain Anda Premium")
                              return invalids;
                          }
                      }
                  }

                  // Custom Field Validation
                  if(this.activeProduct.customfields.length > 0) {
                      this.activeProduct.customfields.forEach((customfield,idx) => {
                          if(customfield.type == "textarea" || customfield.type == "text" || customfield.type == "link" || customfield.type == "password") {
                              if(customfield.required != '' && !this.activeSelections.customfields[idx].value) {
                                  invalids.push(`${customfield.name} is required`)
                              }
                              else if(customfield.regexpr != '') {
                                  var r = customfield.regexpr.split('/')
                                  var flag = ""
                                  // console.log(r)
                                  if(r.length > 2) {
                                      flag = r[2]
                                  }
                                  var re = new RegExp(r[1],flag)
                                  // console.log(re)
                                  var matches = this.activeSelections.customfields[idx].value.match(re)
                                  if(!matches) {
                                      invalids.push(`${customfield.name} is in invalid format`)
                                  }
                              }
                          }
                      })
                  }
                  return invalids;
              },
              addToCart() {
                  this.isAddingToCart = true
                  var invalids = this.validateForm()
                  if(invalids.length > 0) {
                      var strInvalids = invalids.join('\r\n')
                      this.isAddingToCart = false
                      window.alert(strInvalids)
                      return
                  }

                  var productType = (this.products[this.activeProductIndex].domainconfig.showdomainoptions == '1') ? 'productdomain' : 'product'
                  var formdata = {
                      token:document.getElementsByName("token")[0].value,
                      pid:this.activeProduct.pid,
                      a:this.a,
                      skipconfig:this.skipconfig,
                      billingcycle:this.activeSelections.billingcycle,
                  }
                  var encodedFormData = ""
                  var encodedSessionData = ""
                  if(this.activeSelections.configoptions.length > 0) {
                      formdata.configoption={}
                      this.activeSelections.configoptions.forEach((configoption) => {
                          if(typeof(configoption.value) === "object") {
                              if(configoption.value.length > 0) {
                                  formdata.configoption[configoption.id] = configoption.value[0]
                              }
                          }
                          else if(configoption.value) {
                              formdata.configoption[configoption.id] = configoption.value
                          }

                      })
                  }

                  if(this.activeSelections.addons.length > 0) {
                      formdata.addons={}
                      this.activeSelections.addons.forEach((addon) => {
                          if(addon.value) {
                              formdata.addons[addon.id] = "on"
                          }
                      })
                  }

                  if(this.activeSelections.customfields.length > 0) {
                      formdata.customfield={}
                      this.activeSelections.customfields.forEach((customfield) => {
                          if(customfield.value) {
                              if(typeof(customfield.value) === "boolean") {
                                  formdata.customfield[customfield.id] = "on"
                              } else {
                                  formdata.customfield[customfield.id] = customfield.value
                              }
                          }
                      })
                  }

                  switch(productType) {
                      case 'product':
                          formdata.hostname = this.activeSelections.hostname
                          formdata.rootpw = this.activeSelections.rootpw
                          formdata.ns1prefix = this.activeSelections.ns1prefix
                          formdata.ns2prefix = this.activeSelections.ns2prefix

                          encodedFormData = $.param(formdata)
                          axios.post('/cart.php',encodedFormData)
                               .then((response) => {
                                  encodedSessionData = encodedFormData + '&type=confproduct'
                                  axios.post('/ajax/pub/order',encodedSessionData)
                                       .then((response) => {
                                          window.location.href = "cart.php?a=view"
                                       })
                                       .catch(function (error) {
                                          this.isAddingToCart = false
                                          // console.log(error);
                                       })
                               })
                      break

                      case 'productdomain':
                          var domainoption = this.activeSelections.domainoption
                          var sld = this.activeSelections.sld
                          var tld = this.activeSelections.tld
                          var domainsregperiod = 0
                          var idprotection = "off"

                          var eppcode = this.activeSelections.eppcode

                          if( (this.activeSelections.domains.length > 0) || (domainoption == 'owndomain' && sld && tld) ) {
                              formdata.domainoption = domainoption
                              formdata.direct = this.direct
                              formdata.sld = sld
                              formdata.tld = tld

                              if(domainoption != 'owndomain') {
                                  formdata.domains = []
                                  formdata.domainsregperiod = {}

                                  formdata.domains.push(this.activeSelections.domains[0])
                                  // Elements: 0 = domainsregperiod, 1 = idprotection
                                  var strDomainAddons = this.activeSelections.domainsregperiod[0]
                                  var arrDomainAddons = strDomainAddons.split("#")
                                  domainsregperiod = arrDomainAddons[0]
                                  idprotection = arrDomainAddons[1]
                                  formdata.domainsregperiod[this.activeSelections.domains[0]] = domainsregperiod
                              }
                              encodedFormData = $.param(formdata)
                              axios.post('/cart.php',encodedFormData)
                                   .then((response) => {
                                      var sessionData = {
                                          'type':'confdomains',
                                          'sld':sld,
                                          'tld':tld,
                                      }

                                      if(domainoption != 'owndomain') {
                                          sessionData.dnsmanagement = 'on',
                                          sessionData.idprotection = idprotection,
                                          sessionData.epp = eppcode
                                      }

                                      var encodedSessionData = $.param(sessionData)
                                      axios.post('/ajax/pub/order',encodedSessionData)
                                           .then((response) => {
                                              window.location.href = "cart.php?a=view"
                                           })
                                           .catch(function (error) {
                                              this.isAddingToCart = false
                                              // console.log(error);
                                           })
                               })
                          } else {
                              this.isAddingToCart = false
                              window.alert("Mohon 'Cek Domain' Anda terlebih dahulu")
                          }
                      break
                  }
              },
              htmlEntities(str){
                  return String(str).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot/g, '\"');
              }
        };
        this.computed = {
          dottedTLDs() {
                  var dotted = []
                  this.tlds.forEach((tld) => {
                      dotted.push(`.${tld}`)
                  })
                  return dotted
              },
              activeProduct() {
                  var product = this.products[this.activeProductIndex]
                  return {
                      pid:product.pid,
                      name:product.name,
                      optgroup: product.optgroup,
                      formattedname:product.formattedname,
                      showdomain:product.domainconfig.showdomainoptions,
                      freeterms:product.domainconfig.freedomainpaymentterms,
                      freetlds:product.domainconfig.freedomaintlds,
                      pricing:product.pricing[this.currencyCode],
                      paytype:product.paytype,
                      configoptions:product.configoptions.configoption,
                      addons:product.addons,
                      customfields:product.customfields.customfield
                  }
              },
              activeSelections() {
                  return this.selections[this.activeProductIndex][this.activeProduct.formattedname]
              },
              domainSearchVar() {
                  return (this.activeSelections.domainoption == 'register') ? "available" : "unavailable"
              },
              domainInCheck() {
                  return this.activeSelections.sld+this.activeSelections.tld
              },
              isActiveTLDFree() {
                  return this.isTLDFree(this.activeSelections.tld)
              },
              subTotal() {
                  var strCycle = this.activeSelections.billingcycle
                  var strCyclesetupfee = this.activeSelections.billingcycle.substr(0,1)+'setupfee'

                  // Domain calculation
                  var domainprice = 0
                  var domainAddon = 0
                  if(this.activeProduct.showdomain != "0") {
                      if(this.activeSelections.domainCheckResult.length > 0) {
                          var domainoption = this.activeSelections.domainoption

                          var strDomainAddons = this.activeSelections.domainsregperiod[0]
                          var arrDomainAddons = strDomainAddons.split("#")
                          var domainsregperiod = arrDomainAddons[0]
                          var idprotection = arrDomainAddons[1]

                          if(this.isActiveTLDFree) {
                              domainprice = 0
                          } else {
                              domainprice += parseFloat(this.activeSelections.domainCheckResult[0].tldpricing[domainoption][domainsregperiod])
                          }

                          if(idprotection == 'on') {
                              domainAddon += domainsregperiod * parseFloat(this.activeSelections.domainCheckResult[0].tldpricing.addons.price_idprotect)
                          }
                      }
                  }


                  // billing cycle calculation
                  var cyclePrice = parseFloat(this.activeProduct.pricing[strCycle])
                  var cycleSetupFee = parseFloat(this.activeProduct.pricing[strCyclesetupfee])

                  // configuration option calculation
                  var configoptionPrice = 0
                  var configoptionSetupFee = 0
                  if(this.activeSelections.configoptions.length > 0) {
                      this.activeProduct.configoptions.forEach((configoption,idx) => {
                          if(!configoption.hasOwnProperty("hidden")) {
                              if(configoption.type == "1" || configoption.type == "2") {
                                  var selectedOption = configoption.options.option.filter((option) => {
                                      return option.id == this.activeSelections.configoptions[idx].value
                                  })
                                  configoptionPrice += parseFloat(selectedOption[0].pricing[this.currencyCode][strCycle])
                                  configoptionSetupFee += parseFloat(selectedOption[0].pricing[this.currencyCode][strCyclesetupfee])
                              }
                              else if(configoption.type == "3") {
                                  var optid = configoption.options.option[0].id
                                  if(this.activeSelections.configoptions[idx].value.indexOf(optid) >= 0) {
                                      configoptionPrice += parseFloat(configoption.options.option[0].pricing[this.currencyCode][strCycle])
                                      configoptionSetupFee += parseFloat(configoption.options.option[0].pricing[this.currencyCode][strCyclesetupfee])
                                  }
                              }
                              else if(configoption.type == "4") {
                                  if(this.activeSelections.configoptions[idx].value) {
                                      configoptionPrice += this.activeSelections.configoptions[idx].value * parseFloat(configoption.options.option[0].pricing[this.currencyCode][strCycle])
                                      // console.log(this.activeSelections.configoptions[idx].value);
                                      configoptionSetupFee += this.activeSelections.configoptions[idx].value * parseFloat(configoption.options.option[0].pricing[this.currencyCode][strCyclesetupfee])
                                  }
                              }
                          }
                      })
                  }

                  // Addon calculation
                  var addonPrice = 0
                  if(this.activeSelections.addons.length > 0) {
                      this.activeProduct.addons.forEach((addon,idx) => {
                          if(this.activeSelections.addons[idx].value) {
                              addonPrice += parseFloat(addon.raw[strCycle])
                          }
                      })
                  }

                  return domainprice + domainAddon + cyclePrice + cycleSetupFee + configoptionPrice + configoptionSetupFee + addonPrice - this.subTotalCorrection
              },
              // fill id needcorrection if you want to input fixed value
              subTotalCorrection() {
                  var idNeedCorrection = [71,66,65,67,117,118,119,120,121,122,123];

                  var billingCycle = this.activeSelections.billingcycle
                  var setupFee = this.activeSelections.billingcycle.substr(0,1)+'setupfee'
                  var activeConfigOptions = this.activeProduct.configoptions

                  var filteredConfigOptions = activeConfigOptions.filter((configOption) => {
                      return (idNeedCorrection.indexOf(configOption.id) >= 0) && (!configOption.hasOwnProperty("hidden")) ? true : false
                  })
                  if(filteredConfigOptions.length > 0) {
                      var correction = 0.00

                      filteredConfigOptions.forEach((configOption, index) => {
                          var options = configOption.options.option

                          if(configOption.type == "1" || configOption.type == "2") {
                              var filteredOptions = options.filter((option) => {
                                  return option.id == configOption.fixedvalue
                              })
                              if(filteredOptions.length > 0) {
                                  var amount = parseFloat(filteredOptions[0].pricing[this.currencyCode][billingCycle])
                                  var setupFeeAmount = parseFloat(filteredOptions[0].pricing[this.currencyCode][setupFee])
                                  correction = correction + amount + setupFeeAmount
                              }
                          }
                          else if(configOption.type == "3") {

                              if(configOption.fixedvalue == "checked") {
                                  var amount = parseFloat(options[0].pricing[this.currencyCode][billingCycle])
                                  var setupFeeAmount = parseFloat(options[0].pricing[this.currencyCode][setupFee])
                                  correction = correction + amount + setupFeeAmount
                              }
                          }
                          else if(configOption.type == "4") {
                              var amount = configOption.fixedvalue * parseFloat(options[0].pricing[this.currencyCode][billingCycle])
                              var setupFeeAmount = configOption.fixedvalue * parseFloat(options[0].pricing[this.currencyCode][setupFee])
                              correction = correction + amount + setupFeeAmount
                          }

                      })
                      // console.log(correction)
                      return correction
                  } else {
                      return 0.00
                  }

              }
        };
    }

    created(){
      var sel = {};
            this.products.forEach((product, index) => {
                var pname = product.name.replace(/\s+/g,"").toLowerCase();
                product.formattedname = pname;
                sel[pname] = {
                  showdomainoptions:"0",
                  domainoption:"",
                  sld:"",
                  tld:"",
                  billingcycle:"",
                  configoptions:[],
                  addons:[],
                  customfields:[],
                  // optgroup:[],
                  hostname:"",
                  rootpw:"rootpw",
                  ns1prefix:"ns1",
                  ns2prefix:"ns2"
                };

                // Domain Config Initialization
                if(product.domainconfig.showdomainoptions != "0") {
                    sel[pname].showdomainoptions = "1"
                    sel[pname].domainoption = "register"
                    sel[pname].tld = ".com"
                    sel[pname].domainCheckResult = []
                    sel[pname].domains = []
                    sel[pname].domainsregperiod = []
                    sel[pname].eppcode = ""
                }
                // End of Domain Config Initialization

                // Billing cycle initialization
                if(this.forcecycle) {
                    sel[pname].billingcycle = this.forcecycle;
                }
                else if(product.paytype == "free") {
                    sel[pname].billingcycle = "free";
                }
                else if(product.paytype == "onetime") {
                    sel[pname].billingcycle = "onetime";
                }
                else if(product.paytype == "recurring") {
                    var cycleExists = this.cycles.find((c) => {
                      return (product.pricing[this.currencyCode][c] != '0.00' || product.pricing[this.currencyCode][c.substr(0,1)+'setupfee'] != '0.00') && product.pricing[this.currencyCode][c] != '-1.00';
                    });

                    sel[pname].billingcycle = cycleExists;
                }
                // End of Billing cycle initialization

                // Config Options initialization
                var configOptions = product.configoptions.configoption
                configOptions.forEach((configOption) => {
                    if(configOption.fixedvalue) {
                      if(configOption.type == 1 || configOption.type == 2 || configOption.type == 4){
                          sel[pname].configoptions.push({id:configOption.id, value:configOption.fixedvalue})
                      } else if( configOption.type == 3) {
                          sel[pname].configoptions.push({id:configOption.id, value:[configOption.options.option[0].id]})
                      }
                    } else {
                        if(configOption.type == 1 || configOption.type == 2){
                            sel[pname].configoptions.push({id:configOption.id, value:configOption.options.option[0].id})
                        }
                        else if(configOption.type == 3) {
                            sel[pname].configoptions.push({id:configOption.id, value:[]})
                        }
                        else if(configOption.type == 4) {
                            sel[pname].configoptions.push({id:configOption.id, value:0})
                        }
                    }

                })
                // End of Config Options initialization

                // Addons initialization
                var addons = product.addons
                addons.forEach((addon) => {
                  if(addon.billingcycle == "free" || addon.billingcycle == "Free Account") {
                      sel[pname].addons.push({id:addon.id, value:true})
                  } else {
                      sel[pname].addons.push({id:addon.id, value:false})
                  }

                })
                // End of Addons initialization

                // Custom Fields initialization
                var customfields = product.customfields.customfield
                customfields.forEach((customfield) => {
                    if(customfield.type == "textarea" || customfield.type == "text" || customfield.type == "link" || customfield.type == "password") {
                        sel[pname].customfields.push({id:customfield.id, value:""})
                    }
                    else if(customfield.type == "tickbox") {
                        sel[pname].customfields.push({id:customfield.id, value:false})
                    }
                    else if(customfield.type == "dropdown") {
                        sel[pname].customfields.push({id:customfield.id, value:customfield.options[0]})
                    }
                })

                // Option Group Initialization
                // var optgroups = product.optgroup
                // optgroups.forEach((optgroup) => {
                //     sel[pname].optgroup.push(optgroup);
                // })

                // End of Custom fields initialization
                this.selections.push(sel);
                sel = {};
            })

          // Patch for filtering Windows and Linux VPS
          if(os_template_windows_pipe) {
              this.osTemplateWindows = os_template_windows_pipe
          }
    }
}

jQuery(document).ready(function ($) {
    $.urlParam = function(name){
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if(results == null) {
            return -1;
        }
        return results[1];
    }

    $('div[id^="dwproductmodal"]').on('shown.bs.modal', function (e) {
        $(this).find('.expandable').css('cursor', 'pointer');

        $('.modal-dialog .expandable').unbind('click');

        $('.modal-dialog .expandable').click(function () {
            var showHide = $(this).find(".showHideTri");
            var showHideDown = '<i class="fa fa-sort-desc" aria-hidden="true"></i>';
            var showHideUp = '<i class="fa fa-sort-asc" aria-hidden="true"></i>';
            $(showHide).html(showHideUp);
            $(this).next('.hideaddons').slideToggle(function () {
                if ($(this).is(':hidden')) {
                    $(showHide).html(showHideDown);
                } else {
                    $(showHide).html(showHideUp);
                }
            });
        });
    })
    $('.m-dwProductBox__nav a').each(function() {
        $(this).click(function() {
            $('.nav.nav-pills li').removeClass('active');
            $('.nav.nav-pills li a[href="'+$(this).attr('href')+'"]').parent().addClass('active');
        });
    });

    var activeProduct = $.urlParam('pmid');
    if(activeProduct != -1) {
        productVue.activeProductIndex = activeProduct;
        $('#dwproductmodal').modal('toggle');
    }
});
