mkdir deps
cd deps
mkdir temp
echo "Cloning NativeUILua"
git clone -b 1-js-support https://github.com/tomezpl/NativeUILua.git temp/NativeUILua
echo "Extracting NativeUI code from NativeUILua repo"
cp -r temp/NativeUILua/NativeUI NativeUI
echo "Cloning alertbox"
git clone https://github.com/tomezpl/alertbox alertbox
echo "Cleaning up"
rm -r temp
cd ../
git submodule update --init --recursive