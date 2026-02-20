// sap.ui.define([
//     "sap/ui/core/mvc/Controller"
// ], (Controller) => {
//     "use strict";

//     return Controller.extend("com.bgl.app.vendorageing2.controller.VendorAgeingReport", {
//         onInit() {
//         }
//     });
// });

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    'sap/m/Label',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/comp/smartvariants/PersonalizableInfo',
    'sap/m/MessageBox',
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageToast",
    "sap/m/StandardListItem",
    "sap/ui/core/Fragment"
], (Controller, JSONModel, Label, Filter, FilterOperator, PersonalizableInfo, MessageBox, exportLibrary, Spreadsheet, MessageToast, StandardListItem, Fragment) => {
    "use strict";
    const EdmType = exportLibrary.EdmType;
    return Controller.extend("com.bgl.app.vendorageing2.controller.VendorAgeingReport", {
        onInit() {

            this.oModel = new JSONModel();
            this._pdfViewer = new sap.m.PDFViewer({
                showDownloadButton: true
            });
            this.getView().addDependent(this._pdfViewer);

            sap.ui.getCore().setModel(this.oModel, "UIDataModel");
            sap.ui.getCore().getModel("UIDataModel").setProperty("/Visible", true);
            sap.ui.getCore().getModel("UIDataModel").setProperty("/Invisible", false);
            //this.applyData = this.applyData.bind(this);
            //this.fetchData = this.fetchData.bind(this);
            //this.getFiltersWithValues = this.getFiltersWithValues.bind(this);

            this.oSmartVariantManagement = this.getView().byId("svm");
            this.oExpandedLabel = this.getView().byId("expandedLabel");
            this.oSnappedLabel = this.getView().byId("snappedLabel");
            this.oFilterBar = this.getView().byId("filterbar");
            this.oTable = this.getView().byId("table");

            this.oFilterBar.registerFetchData(this.fetchData);
            this.oFilterBar.registerApplyData(this.applyData);
            this.oFilterBar.registerGetFiltersWithValues(this.getFiltersWithValues);

            var oPersInfo = new PersonalizableInfo({
                type: "filterBar",
                keyName: "persistencyKey",
                dataSource: "",
                control: this.oFilterBar
            });
            this.oSmartVariantManagement.addPersonalizableControl(oPersInfo);
            this.oSmartVariantManagement.initialise(function () { }, this.oFilterBar);

            // this.getBusinessPlaceF4Data();


        },
        // getBusinessPlaceF4Data: function () {

        //     var that = this;

        //     var oModel = this.getOwnerComponent().getModel("zbp_f4_srv");

        //     // create list binding
        //     var oBinding = oModel.bindList("/placeSet");

        //     // request contexts (like array of rows)
        //     oBinding.requestContexts().then(function (aContexts) {
        //         var oData = aContexts.map(function (oContext) {
        //             return oContext.getObject();   // extract actual data object
        //         });

        //         console.log("Fetched Business F4 List: ", oData);

        //         var oBusinessModel = that.getOwnerComponent().getModel("businessModel");
        //         oBusinessModel.setData(oData);

        //         sap.ui.core.BusyIndicator.hide();
        //     }).catch(function (error) {
        //         sap.ui.core.BusyIndicator.hide();
        //         console.log(error);

        //         sap.m.MessageBox.warning(error.message);
        //     });

        // },
        getBusinessPlaceF4Data: function () {
            var that = this;

            // Get the OData V2 model (defined in manifest.json or Component.js)
            var oModel = this.getOwnerComponent().getModel("mainService");

            // Show busy indicator
            sap.ui.core.BusyIndicator.show(0);

            // Read entity set from backend
            oModel.read("/ZFI_BUSINESSPLACE_F4", {
                success: function (oData, response) {
                    // Extract results array from response
                    var aResults = oData.results;

                    console.log("Fetched Business F4 List (V2): ", aResults);

                    // Put data into JSON model for UI binding
                    var oBusinessModel = that.getOwnerComponent().getModel("businessModel");
                    oBusinessModel.setData(aResults);

                    sap.ui.core.BusyIndicator.hide();
                },
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    console.log(oError);

                    sap.m.MessageBox.warning("Failed to fetch Business Place F4 data.");
                }
            });
        },

        onExport: function () {

            const oTable = this.oTable;
            const oBinding = oTable.getBinding("items");
            const aCols = this.createColumnConfig();
            // const oSettings = {
            //     workbook: { columns: aCols },
            //     dataSource: oBinding
            // };
            const oSettings = {
                workbook: {
                    columns: aCols,
                    context: {
                        sheetName: "Vendor Ageing Report" // Sheet tab name
                    }
                },
                dataSource: oBinding,
                fileName: "Vendor Ageing Report" // File name after download
            };
            const oSheet = new Spreadsheet(oSettings);

            oSheet.build()
                .then(function () {
                    MessageToast.show("Spreadsheet export has finished");
                }).finally(function () {
                    oSheet.destroy();
                });
        },
        createColumnConfig: function () {
            return [
                {
                    label: "Vendor Code",
                    property: "VendorCode",
                    type: EdmType.String
                },
                {
                    label: "Vendor Name",
                    property: "VendorName",
                    type: EdmType.String
                },
                {
                    label: "Net O/S Vendor",
                    property: "Net_OS_Vendor",
                    type: EdmType.Decimal
                },
                {
                    label: "Gross O/S Vendor",
                    property: "Gross_OS_Vendor",
                    type: EdmType.Decimal
                },
                {
                    label: "0 TO 30 DAYS",
                    property: "Total_0_30",
                    type: EdmType.Decimal
                },
                // {
                //     label: "30 TO 60 DAYS",
                //     property: "Total_31_60",
                //     type: EdmType.Decimal
                // },
                {
                    label: "31 TO 45 DAYS",
                    property: "Total_31_60",
                    type: EdmType.Decimal
                },
                {
                    label: "46 TO 60 DAYS",
                    property: "Total_46_60",
                    type: EdmType.Decimal
                },
                {
                    label: "61 TO 90 DAYS",
                    property: "Total_61_90",
                    type: EdmType.Decimal
                },
                // {
                //     label: "365 DAYS",
                //     property: "Total_91_365",
                //     type: EdmType.Decimal
                // },
                {
                    label: "91 TO 180 DAYS",
                    property: "Total_91_180",
                    type: EdmType.Decimal
                },
                {
                    label: "181 TO 365 DAYS",
                    property: "Total_181_365",
                    type: EdmType.Decimal
                },
                {
                    label: "1 Year to 2 Years",
                    property: "Total_366_730",
                    type: EdmType.Decimal
                },
                {
                    label: "2 Year to 3 Years",
                    property: "Total_731_1095",
                    type: EdmType.Decimal
                },
                {
                    label: "More than 3 Years",
                    property: "Total_731_plus",
                    type: EdmType.Decimal
                },
                {
                    label: "Accounting Group",
                    property: "SupplierAccountGroup",
                    type: EdmType.String
                },
                {
                    label: "Accounting Group Des",
                    property: "AccountGroupName",
                    type: EdmType.String
                },
                {
                    label: "Reconciliation Account",
                    property: "ReconciliationAccount",
                    type: EdmType.String
                },
                {
                    label: "SPL GL A",
                    property: "SPL_GL_A",
                    type: EdmType.Decimal
                },
                {
                    label: "SPL GL D",
                    property: "SPL_GL_D",
                    type: EdmType.Decimal
                },
                {
                    label: "SPL GL G",
                    property: "SPL_GL_G",
                    type: EdmType.Decimal
                },
                {
                    label: "SPL GL H",
                    property: "SPL_GL_H",
                    type: EdmType.Decimal
                }

            ];
        },
        onExit: function () {
            this.oModel = null;
            this.oSmartVariantManagement = null;
            this.oExpandedLabel = null;
            this.oSnappedLabel = null;
            this.oFilterBar = null;
            this.oTable = null;
        },
        onPressText: function () {
            this.oTable.removeSelections(true);
            var oModel = sap.ui.getCore().getModel("UIDataModel");
            oModel.setProperty('/Visible', !oModel.getProperty('/Visible'));
            oModel.setProperty('/Invisible', !oModel.getProperty('/Invisible'));
        },
        getDateFormatString: function (fullDate) {
            var oDate = fullDate.getDate();
            if (oDate < 10) {
                oDate = "0" + oDate.toString();
            }
            var oMonth = fullDate.getMonth() + 1;
            if (oMonth < 10) {
                oMonth = "0" + oMonth.toString();
            }
            var oYear = fullDate.getFullYear();

            var oDateStr = oYear + "-" + oMonth + "-" + oDate;
            return oDateStr;

        },
        onSearch: function () {
            var that = this;
            // this.byId("pageId").setHeaderExpanded(false);
            var aTableFilters = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                var oControl = oFilterGroupItem.getControl();
                if (oControl instanceof sap.m.DatePicker) {
                    var aSelectedKeys = oControl.getDateValue();
                    if (aSelectedKeys != null) {
                        var oDateStr = that.getDateFormatString(aSelectedKeys);
                        aResult.push(oDateStr);
                    } else {
                        // var arrayOfStrings = oControl.getId().split('-');
                        // var oMessage = "";
                        // var str = ["fromDate", "toDate"];
                        // var found = arrayOfStrings.find(v => str.includes(v));
                        // if (found == "fromDate") {
                        //     oMessage = "Please Fill in the compulsory From-Date Fields";
                        // } else if (found == "toDate") {
                        //     oMessage = "Please Fill in the compulsory To-Date Fields";
                        // }
                        // else {
                        //     oMessage = "Please Fill in the compulsory Fields";
                        // }

                        // MessageBox.error(oMessage);

                        // return;
                    }

                }
                //aSelectedKeys = oControl.getSelectedKeys(),
                /*aFilters = aSelectedKeys.map(function (sSelectedKey) {
                    return new Filter({
                        path: oFilterGroupItem.getName(),
                        operator: FilterOperator.Contains,
                        value1: sSelectedKey
                    });
                });
                
            if (oDate.length > 0) {
                aResult.push(new Filter({
                    filters: aFilters,
                    and: false
                }));
            }
*/
                return aResult;
            }, []);

            // var oTableJsonModel = this.getDataFromBackend(oUrl);


            // For extract From and To Date
            var oDate = aTableFilters[0];
            // this.toDate = aTableFilters[1];
            // // End

            var oGlobalModel = this.getOwnerComponent().getModel("globalModel");
            oGlobalModel.setProperty("/selectedDate", oDate);

            this.getDataFromBackend();


            /*this.oTable.bindItems({
                path: oUrl,
                template: that.oTable.getBindingInfo("items").template
            });*/
            //this.oTable.getBinding("items").filter(aTableFilters);
            //this.oTable.setShowOverlay(false);
        },
        _validateInputFields: function () {
            var inputDate = this.byId("idDate");
            var inputBusinessPlace = this.byId("inputBusinessPlace");

            var isValid = true;
            var message = '';

            if (!inputDate.getValue()) {
                inputDate.setValueState(sap.ui.core.ValueState.Error);
                isValid = false;
                message += 'Date , ';
            } else {
                inputDate.setValueState(sap.ui.core.ValueState.None);
            }
            // if (!inputBusinessPlace.getValue()) {
            //     inputBusinessPlace.setValueState(sap.ui.core.ValueState.Error);
            //     isValid = false;
            //     message += 'Business Place , ';
            // } else {
            //     inputBusinessPlace.setValueState(sap.ui.core.ValueState.None);
            // }

            if (!isValid) {
                // Remove the last comma and space from the message
                message = message.slice(0, -2);
                sap.m.MessageBox.error("Please fill up the following fields: " + message);
                return false;
            }

            return true;
        },
        // getDataFromBackend: function () {
        //     if (!this._validateInputFields()) {
        //         // Validation failed, return without fetching data
        //         return;
        //     }

        //     var oGlobalDataModel = this.getOwnerComponent().getModel("globalModel");
        //     var oGlobalModelData = oGlobalDataModel.getData();
        //     var oNewModel = this.getOwnerComponent().getModel();

        //     // P_KeyDate must be Edm.Date format (yyyy-MM-dd), no quotes
        //     var sKeyDate = oGlobalModelData.selectedDate;

        //     // Build navigation property URL
        //     var oUrl = "/Zfi_Vendorageing_Main(P_KeyDate=" + sKeyDate + ")/Set";

        //     // Dynamic filters
        //     var aFilters = [];

        //     // Company Code filter (single value from input)
        //     var sCompanyCode = this.byId("idComCode").getValue();
        //     if (sCompanyCode) {
        //         aFilters.push(
        //             new sap.ui.model.Filter("CompanyCode", sap.ui.model.FilterOperator.EQ, sCompanyCode)
        //         );
        //     }

        //     // Business Place filter (multi-value array)
        //     var aBusinessId = oGlobalModelData.selectedBusinessId || [];

        //     if (aBusinessId.length > 0) {
        //         var aBusinessFilters = aBusinessId.map(function (busi) {
        //             return new sap.ui.model.Filter("BusinessPlace", sap.ui.model.FilterOperator.EQ, busi);
        //         });

        //         aFilters.push(
        //             new sap.ui.model.Filter({
        //                 filters: aBusinessFilters,
        //                 and: false
        //             })
        //         );
        //     }


        //     sap.ui.core.BusyIndicator.show(0);

        //     // Bind the list
        //     let oBinding = oNewModel.bindList(oUrl);

        //     // Apply filters
        //     oBinding.filter(aFilters);

        //     var that = this;

        //     oBinding.requestContexts(0, 100000).then((aContexts) => {
        //         sap.ui.core.BusyIndicator.hide();

        //         var oReturnModel = new sap.ui.model.json.JSONModel();

        //         if (!aContexts || aContexts.length === 0) {
        //             sap.m.MessageBox.warning("No Data Available!");
        //             // 🔹 Clear table data
        //             oReturnModel.setData([]);
        //             that.oTable.setModel(oReturnModel, "TableDataModel");
        //             return;
        //         }

        //         var oTableData = [];

        //         aContexts.forEach((oContext) => {
        //             var oData = oContext.getObject();
        //             oTableData.push(oData);
        //         });

        //         // Set data to your table model
        //         // var oReturnModel = new sap.ui.model.json.JSONModel();
        //         oReturnModel.setData(oTableData);
        //         that.oTable.setModel(oReturnModel, "TableDataModel");
        //     }).catch((err) => {
        //         sap.ui.core.BusyIndicator.hide();
        //         sap.m.MessageBox.error("An error occurred while fetching data: " + err.message);
        //         console.error(err);
        //     });
        // },
        getDataFromBackend: function () {
            if (!this._validateInputFields()) {
                // Validation failed, return without fetching data
                return;
            }

            var that = this;

            var oGlobalDataModel = this.getOwnerComponent().getModel("globalModel");
            var oGlobalModelData = oGlobalDataModel.getData();
            var oNewModel = this.getOwnerComponent().getModel("mainService");

            // P_KeyDate must be Edm.DateTimeOffset (OData V2 expects datetime'...' format)
            var sKeyDate = oGlobalModelData.selectedDate;  // yyyy-MM-dd
            var sKeyDateFormatted = "datetime" + sKeyDate + "T00:00:00";

            // Build entity path with key
            // var sPath = "/Zfi_Vendorageing_Main(P_KeyDate=" + sKeyDateFormatted + ")/Set";
             var sPath = "/Zfi_Vendorageing_Main(P_KeyDate=datetime'" + sKeyDate + "T00:00:00')/Set";

            // Filters
            var aFilters = [];

            // Company Code filter
            var sCompanyCode = this.byId("idComCode").getValue();
            if (sCompanyCode) {
                aFilters.push(
                    new sap.ui.model.Filter("CompanyCode", sap.ui.model.FilterOperator.EQ, sCompanyCode)
                );
            }

            // Business Place filter (multi-value)
            var aBusinessId = oGlobalModelData.selectedBusinessId || [];
            if (aBusinessId.length > 0) {
                var aBusinessFilters = aBusinessId.map(function (busi) {
                    return new sap.ui.model.Filter("BusinessPlace", sap.ui.model.FilterOperator.EQ, busi);
                });

                aFilters.push(new sap.ui.model.Filter({
                    filters: aBusinessFilters,
                    and: false
                }));
            }

            sap.ui.core.BusyIndicator.show(0);

            oNewModel.read(sPath, {
                filters: aFilters,
                success: function (oData, response) {
                    sap.ui.core.BusyIndicator.hide();

                    var oReturnModel = new sap.ui.model.json.JSONModel();

                    if (!oData.results || oData.results.length === 0) {
                        sap.m.MessageBox.warning("No Data Available!");
                        oReturnModel.setData([]);
                        that.oTable.setModel(oReturnModel, "TableDataModel");
                        return;
                    }

                    console.log("Fetched Data (V2): ", oData.results);

                    oReturnModel.setData(oData.results);
                    that.oTable.setModel(oReturnModel, "TableDataModel");
                },
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    sap.m.MessageBox.error("An error occurred while fetching data.");
                    console.error(oError);
                }
            });
        },

        onOpenBusinessPlaceDialog: function () {
            var oView = this.getView();
            if (!oView.byId("idBusinessPlaceDialog")) {
                sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "com.bgl.app.vendorageing2.Fragment.BusinessPlace",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog)
                    oDialog.open();
                })
            } else {
                oView.byId("idBusinessPlaceDialog").open();
            }
        },
        onCloseBusinessPlaceDialog: function () {
            this.byId("idBusinessPlaceDialog").close();
        },
        onSelectBusinessPlace: function () {
            var oGlobalModel = this.getOwnerComponent().getModel("globalModel");
            var oList = this.byId("idBusinessPlaceList");
            var aSelectedItems = oList.getSelectedItems();
            var aSelectedValues = [];
            var aSelectedID = [];

            // Extract selected  
            aSelectedItems.forEach(function (oItem) {
                aSelectedValues.push(oItem.getTitle()); // Business Id
            });


            // Show selected values in Input field
            var sValue = aSelectedValues.join(", ");
            this.byId("inputBusinessPlace").setValue(sValue);


            var sBusinessValues = this.byId("inputBusinessPlace").getValue(); // Comma-separated values

            var aBusinessArray = sBusinessValues.split(", "); // Convert to array

            console.log("Selected Business Place: ", aBusinessArray);
            oGlobalModel.setProperty("/selectedBusinessId", aBusinessArray);

            var oSearchField = this.byId("idBusinessPlaceSearchField");  // Remove Search Field
            oSearchField.setValue("");
            var oBinding = oList.getBinding("items");
            if (oBinding) {
                oBinding.filter([]); // Remove filters
            }

            oList.removeSelections(true); // Removes all List selections

            var oSelectAllCheckBox = this.byId("selectAllCheckBoxBusinessPlace");
            if (oSelectAllCheckBox) {
                oSelectAllCheckBox.setSelected(false);
            }

            // Close the dialog
            this.byId("idBusinessPlaceDialog").close();
        },
        onBusinessPlaceClear: function (oEvent) {
            var sValue = oEvent.getParameter("value"); // Get the input value
            var oList = this.byId("idBusinessPlaceList"); // Get the list
            var oGlobalModel = this.getOwnerComponent().getModel("globalModel");

            if (!sValue) {    // If input is empty, clear selection
                oList.removeSelections(true); // Deselect all items
                oGlobalModel.setProperty("/selectedBusinessId", "");
            }
        },
        onSearchBusinessPlace: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue"); // Get search input
            var oList = this.byId("idBusinessPlaceList");
            if (!oList) {
                console.error("List not found!");
                return;
            }

            var oBinding = oList.getBinding("items"); // Get binding of the List
            if (!oBinding) {
                console.error("List binding not found!");
                return;
            }

            var aFilters = [];
            if (sQuery && sQuery.length > 0) {
                var oFilter1 = new sap.ui.model.Filter("BUSINESSPLACE", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(new sap.ui.model.Filter({
                    filters: [oFilter1],
                    and: false
                }));
            }

            // Apply the filters to the list binding
            oBinding.filter(aFilters);
        },
        onSelectAllChangeBusinessPlace: function (oEvent) {
            var bSelected = oEvent.getParameter("selected"); // CheckBox state
            var oList = this.byId("idBusinessPlaceList");
            if (!oList) {
                console.error("List not found!");
                return;
            }

            var aItems = oList.getItems(); // Get all list items

            // Select or Deselect all list items based on CheckBox state
            aItems.forEach(function (oItem) {
                oItem.setSelected(bSelected);
            });;
        },
    });
});